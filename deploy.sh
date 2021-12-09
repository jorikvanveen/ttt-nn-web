#!/bin/bash
npm run build
scp -r build/* pi@192.168.2.17:~/ttt/