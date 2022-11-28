import os
import sys
import speech_recognition as sr

LANGUAGES_PATH = 'words'
API_KEY = 'AIzaSyAm8_BfXMcAGDXpJpwA--NVTP6U6pKtWkc'

def get_languages():
    return [file.split('.')[0] for file in os.listdir(LANGUAGES_PATH)]


if len(sys.argv) != 3 and len(sys.argv) != 4:
    print(f'Usage: {sys.argv[0]} input_path output_path [language_id]')
    exit(-1)

input_path = sys.argv[1]
output_path = sys.argv[2]
if len(sys.argv) == 4:
    language = sys.argv[3]
    if language not in get_languages():
        language = 'pl'
else:
    language = 'pl'

r = sr.Recognizer()
with sr.AudioFile(input_path) as source:
    r.adjust_for_ambient_noise(source)
    audio_listened = r.listen(source)

speech_recognition = r.recognize_google(audio_listened, key=API_KEY, language=language, show_all=True)
if not speech_recognition:
    exit(-1)
else:
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(speech_recognition['alternative'][0]['transcript'].lower())