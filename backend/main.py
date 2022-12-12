import string
import librosa
import soundfile as sf
from gtts import gTTS
from pydub import AudioSegment
from pydub.playback import play
from os import listdir, path
from os.path import isfile, join, abspath
import random
from pydub.generators import WhiteNoise
from pydub.generators import Sine
from flask import Flask, request, render_template, jsonify, send_file, make_response, Response
from flask_cors import CORS
import requests
import io
import generate_testcase as gen_test
import recognize_text_from_speech as rtfs

app = Flask(__name__)
# CORS(app, resources='/asd/sendfile')
CORS(app, resources={r"*": {"origins": "*"}})

TESTCASE_SIZE = 5
SYMBOLS = string.ascii_uppercase + string.digits


@app.route('/api/get_words', methods=['GET'])
def get_words():
    # print("get_words")
    words = request.args.get('words', default=1, type=int)  # arg for generate()
    # t = generate(words)
    t = gen_test.gen("res.mp3", "res.txt", int(words), "pl")
    print(t)
    response = make_response(t, 200)
    response.mimetype = "text/plain"
    return response


@app.route('/api/get_sound', methods=['GET'])
def sendfile():
    # print("sendfile")
    dirname = path.dirname(__file__)
    res = path.join(dirname, 'res.mp3')
    with open(res, 'rb') as f:
        res = f.read()

    # response = make_response(res)
    # response.headers.add("Access-Control-Allow-Origin", "*")
    # response.headers.add("Content-type: audio/mpeg")
    return send_file(io.BytesIO(bytes(res)), download_name="result.mp3")


@app.route("/api/validate", methods=['POST'])
def validate():
    # print("validate sound")
    files = request.files
    file = files.get('file')
    print(type(file))
    dirname = path.dirname(__file__)
    res = path.join(dirname, 'to_validate.wav')
    res1 = path.join(dirname, 'stereo_file.wav')

    with open(res, 'wb+') as f:
        file.save(f)

    y, sr = librosa.load(res)
    sf.write(res1, y, sr)

    tmp = rtfs.recognize('stereo_file.wav', 'validation.txt', 'pl')
    print(tmp)
    resp = jsonify({"success": True, "response": "file saved!"})
    resp.headers.add('Access-Control-Allow-Origin', '*')

    return resp


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


def generate(words):
    x = 2
    testcase = generate_testcase(TESTCASE_SIZE)
    dirname = path.dirname(__file__)
    filename = path.join(dirname, 'temp')
    res = path.join(dirname, 'result.mp3')
    print(testcase)
    save_testcase(filename, testcase)
    test = load_testcase(filename)
    result = modify(test)

    result.export(res, format="mp3")
    return "".join(testcase)


if __name__ == '__main__':
    app.run(host='localhost', port='3333', debug=True)
