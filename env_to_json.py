#!/usr/bin/env python
# Converts the old env to a json file
import json
import sys
import csv

try:
    dotenv = sys.argv[1]
except IndexError as e:
    dotenv = '.env'

with open(dotenv, 'r') as f:
    content = f.readlines()

newcontent = []

# removes whitespace chars like '\n' at the end of each line
for x in content:
    if '#' in x:
        y = x.strip().replace("'","\'").replace('#','')
        newcontent.append(['/* '+y,"*/"])  
    elif '=' in x:
        y = x.strip().replace("'","\'")
        y = y.split('=', 1)
        # If value is a csv split it to a list
        if ',' in y[1]:
           y[1] = list(csv.reader([y[1]]))[0]
        else:
           y[1] = y[1].strip() 

        # Try to convert to integer
        try:
            y[1] = int(y[1])
        except:
            pass
        newcontent.append(y)

#print('My list:', *newcontent, sep='\n- ')

print(json.dumps(dict(newcontent), indent=4, separators=(',', ': ')))

