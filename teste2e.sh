#!/usr/bin/env bash

export EMAIL="cypress@prismic.io"
export PASSWORD="AhK9yohhie9ahyohn3w"
export PRISMIC_URL="https://wroom.io"

failures=0
max_runs=5

trap 'failures=$((failures+1))' ERR SIGQUIT SIGTERM

for ((run=1; run <= $max_runs; run++))
do
  echo "#### Run $run of $max_runs #####"
  npm run test:e2e
done

if ((failures == 0)); then
  echo "### Success 🎉 ###"
else
  echo "### $failures out of $max_runs runs failed 🥲 ###"
  exit 1
fi
