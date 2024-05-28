#!/bin/bash
clang++ -std=c++17 -msse4 -mavx2 -fPIC -O3 -march=native -mtune=native -c ada/ada.cpp -o ada.o
clang++ -flto -shared ada.o -o ada.so
