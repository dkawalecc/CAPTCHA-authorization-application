import pyaudio
import sys
import keyboard
import wave

FRAMES_PER_BUFFER = 24000
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 24000

def keyboard_hook(keyboard_event):
    global recording
    if keyboard_event.name == 'space' and keyboard_event.event_type == 'down':
        recording = not recording


if len(sys.argv) != 2:
    print(f'Usage: {sys.argv[0]} output path')
    exit(-1)


output_path = sys.argv[1]
recording = False


keyboard.hook(keyboard_hook)
print('\rWcysnij dowolny klawisz, żeby rozpocząć nagrywanie', end='')
while not recording:
    pass

print('\rWcysnij dowolny klawisz, żeby zakończyć nagrywanie', end='')

p = pyaudio.PyAudio()
stream = p.open(
    format=FORMAT,
    channels=CHANNELS,
    rate=RATE,
    input=True,
    frames_per_buffer=FRAMES_PER_BUFFER
)
frames = []
while recording:
    data = stream.read(FRAMES_PER_BUFFER)
    frames.append(data)

stream.stop_stream()
stream.close()
p.terminate()

obj = wave.open(output_path, 'wb')
obj.setnchannels(CHANNELS)
obj.setframerate(RATE)
obj.setsampwidth(p.get_sample_size(FORMAT))
obj.writeframes(b''.join(frames))
obj.close()