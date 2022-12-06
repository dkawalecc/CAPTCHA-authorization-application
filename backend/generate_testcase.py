import sys
import os
import random
from gtts import gTTS

LANGUAGES_PATH = 'words'

def get_languages():
    return [file.split('.')[0] for file in os.listdir(LANGUAGES_PATH)]

def generate_testcase(n, language):
    with open(os.path.join(LANGUAGES_PATH, f'{language}.txt'), 'r', encoding='utf-8') as file:
        lines = file.readlines()
    inds = random.sample(range(0, len(lines) - 1), n)
    out = ''
    for i in inds:
        out += lines[i].strip() + ' '
    return out[:-1]

def save_testcase(testcase, language, path):
    gTTS(text=testcase, lang=language, slow=False).save(path)

if len(sys.argv) != 4 and len(sys.argv) != 5:
    print(f'Usage: {sys.argv[0]} output_audio_path output_text_path size [language_id]')
    exit(-1)

output_audio_path = sys.argv[1]
output_text_path = sys.argv[2]

if not sys.argv[3].isnumeric():
    print(f'Thrid argument shall be a number')
    exit(-1)
n = int(sys.argv[3])

if len(sys.argv) == 5:
    language = sys.argv[4]
    if language not in get_languages():
        language = 'pl'
else:
    language = 'pl'

testcase = generate_testcase(n, language)
save_testcase(testcase, language, output_audio_path)
with open(output_text_path, 'w', encoding='utf-8') as file:
    file.write(testcase)