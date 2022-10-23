const download = async (path, filename, extension) => {
    const serverUrl = window.location.protocol + "//" + window.location.host;

    const response = await fetch(serverUrl + path, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "auth-token": token,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers":
                "Origin, X-Requested-With, Content-Type, Accept",
        },
    });
    const reader = response.body.getReader();
    var bytes = (await reader.read()).value;
    _download(bytes, filename, extension);
};

function _download(body, filename, extension) {
    const blob = new Blob([body]);
    const fileName = `${filename}.${extension}`;
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, fileName);
    } else {
        var link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const utils = {
    download,
};

export default utils;
