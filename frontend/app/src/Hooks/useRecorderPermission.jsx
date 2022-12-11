import { useState, useEffect } from "react";
import RecordRTC, { RecordRTCPromisesHandler } from "recordrtc";

export const useRecorderPermission = () => {
    const [recorder, setRecorder] = useState();
    const [tracks, setTracks] = useState();
    useEffect(() => {
        getPermissionInitializeRecorder();
    }, []);

    const getPermissionInitializeRecorder = async () => {
        await navigator.mediaDevices
            .getUserMedia({
                audio: true,
                echoCancellation: true,
            })
            .then((stream) => {
                console.log(tracks);
                setTracks(stream.getAudioTracks());
                let recorder = new RecordRTCPromisesHandler(stream, {
                    type: "audio",
                });
                setRecorder(recorder);
            })
            .catch((e) => {
                console.log(e);
            });
    };

    return [recorder, tracks];
};
