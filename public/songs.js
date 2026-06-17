fetch("/songs")
.then(response => response.json())
.then(files => {

    const songs = document.getElementById("songs");

    files.forEach(file => {

        const audio =
            document.createElement("audio");

        audio.controls = true;

        audio.src = "/songs/" + file;

        songs.appendChild(audio);

        songs.appendChild(
            document.createElement("br")
        );

    });

});

const deleteBtn = document.createElement("button");

deleteBtn.innerText ="🗑";

deleteBtn.onclick = () => {

    fetch("/delete-song", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            file: file
        })
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        location.reload();

    });

};