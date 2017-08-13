#!/bin/bash


ls 20170731/20170731_OB_*.xml | xargs -P 6 -n 1 node parse-ruian.js 20170731/20170731_ST_UKSH.xml