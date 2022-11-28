import os
import sys

LANGUAGES_PATH = 'words'
NUMBER_AUDIO_PATH = 'number.wav'
NUMBER_STRING_PATH = 'number.txt'
TESTCASE_AUDIO_PATH = 'testcase.wav'
TESTCASE_STRING_PATH = 'testcase.txt'
RESPONSE_AUDIO_PATH = 'response.wav'
RESPONSE_STRING_PATH = 'response.wav'
MAX_DISTANCE = 3

def get_languages():
    return [file.split('.')[0] for file in os.listdir(LANGUAGES_PATH)]

def edit_distance(s1, s2):
    m=len(s1)+1
    n=len(s2)+1

    tbl = {}
    for i in range(m): tbl[i,0]=i
    for j in range(n): tbl[0,j]=j
    for i in range(1, m):
        for j in range(1, n):
            cost = 0 if s1[i-1] == s2[j-1] else 1
            tbl[i,j] = min(tbl[i, j-1]+1, tbl[i-1, j]+1, tbl[i-1, j-1]+cost)

    return tbl[i,j]

def reposne_match_tescase(response, testcase):
    tokens1 = response.split(' ')
    tokens2 = testcase.split(' ')
    if len(tokens1) != len(tokens2):
        return False
    for i in range(len(tokens1)):
        if edit_distance(tokens1[i], tokens2[i]) > MAX_DISTANCE:
            return False
    return True

if len(sys.argv) != 1 and len(sys.argv) != 2:
    print(f'Usage: {sys.argv[0]} [language_id]')
    exit(-1)

if len(sys.argv) == 2:
    language = sys.argv[1]
    if language not in get_languages():
        language = 'pl'
else:
    language = 'pl'

print('Podaj liczbe slów do wygenerowania')

error_code = -1
while error_code == -1:
    error_code = os.system(f'python record_sound.py {NUMBER_AUDIO_PATH}')
    print('\r', end='')
    if error_code == 0:
        error_code = os.system(f'python recognize_number_from_speech.py {NUMBER_AUDIO_PATH} {NUMBER_STRING_PATH} {language}')

with open(NUMBER_STRING_PATH, 'r') as file:
    n = int(file.read())

os.system(f'python generate_testcase.py {TESTCASE_AUDIO_PATH} {TESTCASE_STRING_PATH} {n} {language}')
with open(TESTCASE_STRING_PATH, 'r', encoding='utf-8') as file:
    testcase = file.read()
print('Powiedz:', testcase, '                                           ')

error_code = -1
while error_code == -1:
    os.system(f'python record_sound.py {RESPONSE_AUDIO_PATH}')
    error_code = os.system(f'python recognize_text_from_speech.py {RESPONSE_AUDIO_PATH} {RESPONSE_STRING_PATH} {language}')
with open(RESPONSE_STRING_PATH, 'r', encoding='utf-8') as file:
    response = file.read()


print(f'\rT: {testcase}                                 ')
print(f'R: {response}')
if reposne_match_tescase(response, testcase):
    print('Success')
else:
    print('Failure')