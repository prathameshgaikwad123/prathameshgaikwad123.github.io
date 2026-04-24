const elements = document.querySelectorAll(".fade");

window.addEventListener("scroll", () => {
elements.forEach(el => {
const position = el.getBoundingClientRect().top;
const screen = window.innerHeight;

```
if (position < screen - 50) {
  el.classList.add("show");
}
```

});
});
