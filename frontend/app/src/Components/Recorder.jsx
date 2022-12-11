import { useRecorderPermission } from "../Hooks/useRecorderPermission";
import React from "react";
import RecordRTC from "recordrtc";
import { useState } from "react";

export const Recorder = ({ fileName }) => {
    const [recorder, tracks] = useRecorderPermission("audio");
    const [state, setState] = useState({
        recording: false,
    });

    const startRecording = async () => {
        if (recorder === undefined) {
            alert("Couldn't connect to the user's microphone!");
            return;
        }
        recorder.startRecording();
        setState({ ...state, recording: true });
    };

    const stopRecording = async () => {
        await recorder.stopRecording();
        let blob = await recorder.getBlob();
        // RecordRTC.invokeSaveAsDialog(blob, `${fileName}.webm`);

        let data = new FormData();
        data.append("file", blob, "file");
        await fetch("http://localhost:3333/api/validate", {
            method: "POST",
            body: data,
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.success) {
                    console.log(json);
                    // window.location = "/resource";\
                    if (tracks !== undefined) {
                        tracks[0].stop();
                    }
                }
                setState({ ...state, recording: false });
            });
    };

    return (
        <div className="recording">
            <button disabled={state.recording} onClick={startRecording}>
                Start recording
            </button>
            <button disabled={!state.recording} onClick={stopRecording}>
                Stop and send
            </button>
        </div>
    );
};
