fetch("/testsongs")
.then(response => response.json())
.then(files => {

    const songs = document.getElementById("songs");

    if (!songs) return;

    files.forEach(file => {

        if (file === ".keep") return;

        const wrapper =
            document.createElement("div");

        const audio =
            document.createElement("audio");

        audio.controls = true;

        audio.src = "/songs/" + file;

        wrapper.appendChild(audio);

const deleteBtn = document.createElement("button");

deleteBtn.innerText ="🗑";

deleteBtn.onclick = () => {

    const confirmed = confirm(
        "Вы уверены, что хотите удалить эту песню?"
    );

    if (!confirmed) {
        return;
    }

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

wrapper.appendChild(deleteBtn);

songs.appendChild(wrapper);

songs.appendChild(
    document.createElement("br")
);
});
});