#include <stdio.h>
#include <time.h>
#include <string.h>
#include <openssl/ssl.h>

// https://gist.github.com/ccbrown/9722406
void hexdump (const void* data, size_t size) {
	char ascii[17];
	size_t i, j;
	ascii[16] = '\0';
	for (i = 0; i < size; ++i) {
		printf("%03d ", ((unsigned char*)data)[i]);
		if (((unsigned char*)data)[i] >= ' ' && ((unsigned char*)data)[i] <= '~') {
			ascii[i % 16] = ((unsigned char*)data)[i];
		} else {
			ascii[i % 16] = '.';
		}
		if ((i+1) % 8 == 0 || i+1 == size) {
			printf(" ");
			if ((i+1) % 16 == 0) {
				printf("|  %s \n", ascii);
			} else if (i+1 == size) {
				ascii[(i+1) % 16] = '\0';
				if ((i+1) % 16 <= 8) {
					printf(" ");
				}
				for (j = (i+1) % 16; j < 16; ++j) {
					printf("   ");
				}
				printf("|  %s \n", ascii);
			}
		}
	}
}

/*
on linux

gcc -O3 -mtune=native -march=native -msse4 -mavx2 -o hash-c hash-c.c -lcrypto
527 ns/op

gcc -O3 -mtune=native -march=native -msse4 -mavx2 -o hash-c-boring hash-c.c ../../lo/lib/boringssl/deps/boringssl/build/crypto/libcrypto.a
268 ns/op

on macos
brew install openssl@3
gcc -I/opt/homebrew/opt/openssl@3/include -L/opt/homebrew/opt/openssl@3/lib -O3 -mtune=native -march=native -msse4 -mavx2 -o hash-c hash-c.c -lcrypto

*/
#define MAX_STRNLEN 65536

unsigned char expected[16] = { 
  93, 65, 64, 42, 188, 75, 42, 118, 185, 113, 157, 145, 16, 23, 197, 146 
};

unsigned char expectedsha256[32] = { 
  44, 242, 77, 186, 95, 176, 163, 14, 38, 232, 59, 42, 197, 185, 226, 158, 27, 
  22, 30, 92, 31, 167, 66, 94, 115, 4, 51, 98, 147, 139, 152, 36 
};

void hash (const EVP_MD* hasher, EVP_MD_CTX* ctx, const char* payload, 
  unsigned char* output) {
  unsigned int size = 0;
  if (EVP_DigestInit_ex(ctx, hasher, 0) != 1) exit(1);
  if (EVP_DigestUpdate(ctx, payload, strnlen(payload, MAX_STRNLEN)) != 1) 
    exit(1);
  if (EVP_DigestFinal(ctx, output, &size) != 1) exit(1);
  EVP_MD_CTX_reset(ctx);
}

void bench (const char* name, int count, const EVP_MD* hasher, EVP_MD_CTX* ctx, 
  unsigned char* output) {
  float start, end;
  start = (float)clock() / CLOCKS_PER_SEC;
  for (unsigned int i = 0; i < count; i++) hash(hasher, ctx, "hello", output);
  end = (float)clock() / CLOCKS_PER_SEC;
  float elapsed = end - start;
  unsigned int rate = (unsigned int)(count / elapsed);
  unsigned int nanos = (unsigned int)((1000000000.0 / rate));
  //printf("\e[0;33m%s\e[0;0m: %u in %.2f s %.0f rps %.0f ns/op\n", name, count, 
  //  elapsed, rate, nanos);
  printf("\e[0;35m%s\e[0;0m \e[0;33mrate\e[0;0m %u \e[0;32mns/iter\e[0;0m %u\n", name, rate, nanos);
}

int main (int argc, char** argv) {
  EVP_MD_CTX* md5_ctx = EVP_MD_CTX_new();
  EVP_MD_CTX* sha256_ctx = EVP_MD_CTX_new();
  const EVP_MD* md5_hasher = EVP_get_digestbyname("md5");
  const EVP_MD* sha256_hasher = EVP_get_digestbyname("sha256");
  unsigned char md5_output[16];
  unsigned char sha256_output[32];

  int iter = 3;
  if (argc > 1) iter = atoi(argv[1]);
  int runs = 1000000;
  if (argc > 2) runs = atoi(argv[2]);
  int total = 1;
  if (argc > 3) total = atoi(argv[3]);

  hash(md5_hasher, md5_ctx, "hello", md5_output);
  if(memcmp(md5_output, expected, 16) != 0) exit(1);
  hash(sha256_hasher, sha256_ctx, "hello", sha256_output);
  if(memcmp(sha256_output, expectedsha256, 32) != 0) exit(1);

  while (total--) {
    for (int i = 0; i < iter; i++) bench("md5", runs, md5_hasher, md5_ctx, 
      md5_output);
    //hexdump(md5_output, 16);
    for (int i = 0; i < iter; i++) bench("sha256", runs, sha256_hasher, 
      sha256_ctx, sha256_output);
    //hexdump(sha256_output, 32);
  }

  EVP_MD_CTX_free(md5_ctx);
  EVP_MD_CTX_free(sha256_ctx);
}
