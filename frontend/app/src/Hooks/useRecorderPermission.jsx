import { useState, useEffect } from "react";
import RecordRTC, { RecordRTCPromisesHandler } from "recordrtc";

export const useRecorderPermission = () => {
    const [recorder, setRecorder] = useState();

    useEffect(() => {
        getPermissionInitializeRecorder();
    }, []);

    const getPermissionInitializeRecorder = async () => {
        let stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            echoCancellation: true,
        });
        let recorder = new RecordRTCPromisesHandler(stream, {
            type: "audio",
        });
        setRecorder(recorder);
    };

    return recorder;
};
