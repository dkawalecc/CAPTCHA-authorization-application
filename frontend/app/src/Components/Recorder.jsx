import { useRecorderPermission } from "../Hooks/useRecorderPermission";
import React from "react";
import { useState } from "react";

export const Recorder = ({ lang, fileName }) => {
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
        await fetch(`http://localhost:3333/api/validate?lang=${lang}`, {
            method: "POST",
            body: data,
        })
            .then((response) => response.json())
            .then((json) => {
                setState({ ...state, recording: false });
                console.log(json);
                if (json.success) {
                    window.location = "/resource";
                    if (tracks !== undefined) {
                        tracks[0].stop();
                    }
                } else {
                    alert("Incorrect recording");
                }
            });
    };

    return (
        <button
            onClick={() => {
                if (state.recording) {
                    stopRecording();
                } else {
                    startRecording();
                }
            }}
            className="record-btn"
        >
            {state.recording ? "Stop & verify" : "Record audio"}
        </button>
    );
};
