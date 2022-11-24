import string
import librosa
from gtts import gTTS
from pydub import AudioSegment
from pydub.playback import play
from os import listdir, path
from os.path import isfile, join
import random
from pydub.generators import WhiteNoise
from pydub.generators import Sine

TESTCASE_SIZE = 5
SYMBOLS = string.ascii_uppercase + string.digits


def generate_testcase(n):
    return [random.choice(SYMBOLS) for _ in range(n)]


def numpy_to_audio_segment(channel, ts):
    return AudioSegment(
        channel.tobytes(),
        frame_rate=ts,
        sample_width=channel.dtype.itemsize,
        channels=1
    )


def save_testcase(path, test_case):
    for i, ch in enumerate(test_case):
        gTTS(text=ch, lang='en', slow=False).save(join(path, str(i) + '.mp3'))


def play_saved_testcase(path):
    for file in sorted([join(path, f) for f in listdir(path) if isfile(join(path, f))]):
        sound = AudioSegment.from_mp3(file)
        play(sound)


def load_testcase(path):
    result = []
    for file in sorted([join(path, f) for f in listdir(path) if isfile(join(path, f))]):
        channel, ts = librosa.load(file)
        result.append(numpy_to_audio_segment(channel, ts))
    return result


def modify(test_case):
    result = AudioSegment.empty()
    for sound in test_case:
        noise = WhiteNoise().to_audio_segment(duration=len(sound)) - 15
        combined = sound.overlay(noise)
        noise = Sine(random.randint(1, 3)).to_audio_segment(duration=len(sound)) + 2
        combined = combined.overlay(noise)
        result += combined
    return result


if __name__ == '__main__':
    x = 2
    testcase = generate_testcase(TESTCASE_SIZE)
    # dirname = path.dirname(__file__)
    # filename = path.join(dirname, 'temp')
    # res = path.join(dirname, 'result.mp3')
    print(testcase)
    save_testcase(filename, testcase)
    testcase = load_testcase(filename)
    result = modify(testcase)
    result.export(res, format="mp3")
