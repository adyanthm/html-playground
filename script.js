const htmlEl = document.getElementById('html');
const jsEl = document.getElementById('js');
const cssEl = document.getElementById('css');
const output = document.getElementById('output');
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.editor-pane')

// tabs contains all the tabs
tabs.forEach(tab => {
  // take arg tab which is a single tab in the list
  tab.addEventListener("click", ()=>{
    // t is the arg for tab. cant use tab again as its used previously..
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab
    panes.forEach(pane => {
      pane.classList.remove("active")
      if(pane.id==target){
        pane.classList.add("active");
      }
    })
  })
})

let timeout;

function save(){
  localStorage.setItem("html", htmlEl.value);
  localStorage.setItem("css", cssEl.value);
  localStorage.setItem("js", jsEl.value);
}

function load(){
  htmlEl.value = localStorage.getItem("html") || "";
  cssEl.value = localStorage.getItem("css") || "";
  jsEl.value = localStorage.getItem("js") || "";
}

function run(){
  const html = htmlEl.value;
  const css = `<style>${cssEl.value}</style>`;
  const js = `<script>${jsEl.value}<\/script>`;
  output.srcdoc = `
  <!DOCTYPE html>
  <html>
    <head>${css}</head>
    <body>
    ${html}
    ${js}
    </body>
  </html>
  `;
}

function debounceRun(){
  clearTimeout(timeout);
  timeout = setTimeout(run, 250);
}

[htmlEl, jsEl, cssEl].forEach(el => {
  el.addEventListener("input", () => {
    save();
    debounceRun();
  })
})

load();
run();
