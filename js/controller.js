
function verticallyCenter(innerId, containerId)  {
    var container = document.getElementById(containerId);
    var inner = document.getElementById(innerId);

    var inHeight = inner.offsetHeight;
    var conHeight = container.offsetHeight;

    inner.style.marginTop = ((conHeight-inHeight)/2)+'px';
}

verticallyCenter("memorial", "memorial-container");
window.onresize = function () {
    verticallyCenter("memorial", "memorial-container");
}


var testContent = [
    {
        name: "Anne Frank",
        birthYear: 1929,
        deathYear: 1945,
        event: "Holocaust",
        details: "Favorite color: green"
    },
    {

    }
];
