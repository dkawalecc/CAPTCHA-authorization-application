import string
import random
from pyo import *
from gtts import gTTS
from pydub import AudioSegment
import wave


TESTCASE_SIZE = 5
SYMBOLS = string.ascii_uppercase + string.digits


def generate_testcase(n):
    return [random.choice(SYMBOLS) for _ in range(n)]


def save_testcase(path, testcase):
    for i, ch in enumerate(testcase):
        gTTS(text=ch, lang='en', slow=False).save(path + '/' + str(i) + '.wav')


testcase = generate_testcase(TESTCASE_SIZE)
save_testcase('temp', testcase)

spf = AudioSegment.from_file(file = "test.mp3",
                                  format = "mp3")
signal = spf.readframes(-1)

x = 2