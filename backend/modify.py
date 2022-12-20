import librosa
import numpy as np
import soundfile as sf
from playsound import playsound

DIFFICULTY = 100

#adds sine wave distortion to a given signal
def add_sin_distortion(y, sr, amplitude, frequancy, phase):
    n_frames = y.shape[0]
    t_start = 0
    t_end =  n_frames / sr + phase
    times = np.linspace(t_start, t_end, n_frames)
    return y + amplitude * np.sin(times * frequancy + phase)


#replaces m random frames with n copies of themselves
def duplicate_frames_in_random_location(y, n, m):
    if n * m == 0:
        return y
    inds = sorted(np.random.choice(range(0, y.shape[0] - 1), size=m))
    vals = [y[ind] for ind in inds]
    for i in range(len(inds)):
        values = np.full((n - 1,), vals[i])
        y = np.insert(y, inds[i] + (n - 1) * i, values)
    return y

#removes n frames from m random places
def remove_frames_in_random_location(y, n, m):
    if n * m == 0:
        return y
    for i in range(m):
        ind = np.random.randint(0, y.shape[0] - 1 - n)
        y = np.concatenate((y[:ind], y[ind+n:]))
    return y

#randombly changes speed of sound
def random_speed_change(y, delta):
    if np.random.randint(0, 2):
        # spped up
        new_length = int(y.shape[0] * np.random.uniform(1.0 - delta, 1.0 - delta * 0.7))
    else:
        # slow downd
        new_length = int(y.shape[0] * np.random.uniform(1.0 + delta * 0.7, 1.0 + delta))

    x = np.linspace(0, y.shape[0], new_length)
    temp = np.interp(x, np.arange(y.shape[0]), y)
    return temp

y, sr = librosa.load('testcase.wav')

y = add_sin_distortion(y, sr, 1.0 + DIFFICULTY / 1000 , 0.02 * DIFFICULTY, 0.03 * DIFFICULTY)
y = duplicate_frames_in_random_location(y, 50 * DIFFICULTY, DIFFICULTY // 50)
y = remove_frames_in_random_location(y, 1000, DIFFICULTY // 25)
y = random_speed_change(y, DIFFICULTY / 300.0)

sf.write('testcase_modfied.wav', y, sr)
playsound('testcase_modfied.wav')