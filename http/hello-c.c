#include <netdb.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <sys/epoll.h>
#include <errno.h>
#include <unistd.h>
#include "picohttpparser.h"

#define MAXEVENTS 64
#define BUFSIZE 16384

char* response = "HTTP/1.1 200 OK\r\nDate: Sun, 17 Sep 2023 02:45:22 GMT\r\nContent-Type: text/plain;charset=utf-8\r\nContent-Length: 15\r\n\r\nHello from c!!!";
int reslen;
int server_fd;
char buf[BUFSIZE];
int epoll_fd;

void accept_and_add_new() {
  struct epoll_event event;
  int fd;
  while ((fd = accept4(server_fd, NULL, NULL, O_NONBLOCK)) != -1) {
    event.data.fd = fd;
    event.events = EPOLLIN | EPOLLOUT;
    if (epoll_ctl(epoll_fd, EPOLL_CTL_ADD, fd, &event) == -1) {
      //perror("epoll_ctl");
      abort();
    }
  }
  if (errno != EAGAIN && errno != EWOULDBLOCK) {
    //perror("accept");
  }
}

void process_new_data(int fd) {
  ssize_t count = recv(fd, buf, BUFSIZE, 0);
  if (count > 0) {
    const char* method;
    const char* path;
    size_t method_len = 0;
    size_t path_len = 0;
    int32_t minor_version = 1;
    size_t num_headers = 16;
    struct phr_header headers[16];
    int nread = phr_parse_request(buf, count, 
      (const char **)&method, 
      &method_len, (const char **)&path, 
      &path_len, &minor_version, headers, 
      &num_headers, 0);
    if (nread == count) {
      if(send(fd, response, reslen, 0) != reslen) {
        perror("short_write");
      }
      return;
    }
  }
  if (count < 0 && (errno == EAGAIN || errno == EWOULDBLOCK)) {
    return;
  }
  //perror("socket_error");
  close(fd);
}

int main () {
  struct epoll_event event, *events;
  struct sockaddr_in server_addr;
  int opt = 1;
  if ((server_fd = socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)) == -1) {
    perror("socket");
    exit(1);
  }
  if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(int)) == -1) {
    perror("setsockopt");
    exit(1);
  }
  reslen = strlen(response);
  server_addr.sin_family = AF_INET;
  server_addr.sin_port = htons(3000);
  server_addr.sin_addr.s_addr = INADDR_ANY;
  bzero(&(server_addr.sin_zero), 8);
  if (bind(server_fd, (struct sockaddr *)&server_addr, sizeof(struct sockaddr)) == -1) {
    perror("bind");
    exit(1);
  }
  if (listen(server_fd, SOMAXCONN) == -1) {
    perror("Listen");
    exit(1);
  }
  epoll_fd = epoll_create1(EPOLL_CLOEXEC);
  if (epoll_fd == -1) {
    perror("epoll_create1");
    exit(1);
  }
  event.data.fd = server_fd;
  event.events = EPOLLIN;
  if (epoll_ctl(epoll_fd, EPOLL_CTL_ADD, server_fd, &event) == -1) {
    perror("epoll_ctl");
    exit(1);
  }
  events = (struct epoll_event *)calloc(MAXEVENTS, sizeof(event));
  while (1) {
    int n, i;
    n = epoll_wait(epoll_fd, events, MAXEVENTS, -1);
    for (i = 0; i < n; i++) {
      if (events[i].events & EPOLLERR || events[i].events & EPOLLHUP) {
        //perror("epoll error");
        close(events[i].data.fd);
      } else if (events[i].data.fd == server_fd) {
        accept_and_add_new();
      } else {
        process_new_data(events[i].data.fd);
      }
    }
  }
  free(events);
  close(server_fd);
  return 0;
}
