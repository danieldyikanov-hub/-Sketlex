function toggleMenu() {
    document.getElementById("menu")
        .classList.toggle("active");
}

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

document.querySelectorAll(".links-button")
.forEach(button => {

    button.onclick = () => {

        const links =
            button.nextElementSibling;

        links.classList.toggle("active");

    };

});