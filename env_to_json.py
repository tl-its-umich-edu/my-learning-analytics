#!/usr/bin/env python
# Converts the old env to a json file
import json
import sys
import csv

from typing import Any

_BOOLEANS = {'1': True, 'yes': True, 'true': True, 'on': True,
             '0': False, 'no': False, 'false': False, 'off': False}

def cast_boolean(value):
    """
    Helper to convert config values to boolean as ConfigParser do.
    """
    value = str(value)
    if value.lower() not in _BOOLEANS:
        return value

    return _BOOLEANS[value.lower()]

try:
    dotenv = sys.argv[1]
except IndexError as e:
    dotenv = '.env'

with open(dotenv, 'r') as f:
    content = f.readlines()

newcontent = []

# removes whitespace chars like '\n' at the end of each line
y: Any
for x in content:
    if '#' in x:
        y = x.strip().replace("'","\'").replace('#','')
        newcontent.append(['/* '+y,"*/"])  
    elif '=' in x:
        y = x.strip().replace("'","\'")
        y_split: Any = y.split('=', 1)
        # If value is a csv split it to a list
        if ',' in y_split[1]:
           y_split[1] = list(csv.reader([y_split[1]]))[0]
        else:
           y[1] = y[1].strip() 
           # Try to convert to integer
           try:
               y[1] = int(y[1])
           except:
               # Try to convert to boolean
               y[1] = cast_boolean(y[1])
        newcontent.append(y)

#print('My list:', *newcontent, sep='\n- ')

print(json.dumps(newcontent, indent=4, separators=(',', ': ')))

