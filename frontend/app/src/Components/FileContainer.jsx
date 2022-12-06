import React from "react";
import { useState } from "react";

function FileContainer() {
  const [state, setState] = useState({ output: "" });

  function uploadFile(form) {
    const formData = new FormData(form);
    // var oOutput = document.getElementById("static_file_response");
    var oReq = new XMLHttpRequest();
    oReq.open("POST", "upload_static_file", true);
    oReq.onload = function (oEvent) {
      if (oReq.status === 200) {
        // oOutput.innerHTML = "Uploaded!";
        state.output = "Uploaded!";
        console.log(oReq.response);
      } else {
        state.output = "Error occurred when trying to upload your file.<br />";
        // oOutput.innerHTML =
        //   "Error occurred when trying to upload your file.<br />";
      }
    };
    // oOutput.innerHTML = "Sending file!";
    state.output = "Sending file";
    console.log("Sending file!");
    oReq.send(formData);
  }

  return (
    <>
      <form
        encType="multipart/form-data"
        onSubmit={() => {
          return false;
        }}
      >
        <input id="file" type="file" name="static_file" />
        <button id="upload-button" onClick={uploadFile}>
          Upload
        </button>
      </form>
      <div id="static_file_response"> </div>
    </>
  );
}

export default FileContainer;
