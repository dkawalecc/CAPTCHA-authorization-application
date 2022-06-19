import string
import random

from gtts import gTTS
from pydub import AudioSegment
import wave

TESTCASE_SIZE = 5
SYMBOLS = string.ascii_uppercase + string.digits


def generate_testcase(n):
    return [random.choice(SYMBOLS) for _ in range(n)]


def save_testcase(path, testcase):
    for i, ch in enumerate(testcase):
        gTTS(text=ch, lang='en', slow=False).save(path + '/' + str(i) + '.mp3')


testcase = generate_testcase(TESTCASE_SIZE)
save_testcase('temp', testcase)

spf = AudioSegment.from_mp3(file="./temp/1.mp3")
print(spf.duration_seconds)
x = 2
