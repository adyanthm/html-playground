// core
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
// features
import { lineNumbers } from "@codemirror/view";
import { highlightActiveLine } from "@codemirror/view";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
// langs
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language";
//theme
import { oneDark } from "@codemirror/theme-one-dark";

const output = document.getElementById('output');
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.editor-pane');
const divider = document.getElementById('divider');
const code = document.querySelector('.code');
const preview = document.querySelector('.preview');
const container = document.querySelector(".container");


// Create codemirror editor 

function createEditor(parentId, lang, initialValue){
  return new EditorView({
    state : EditorState.create({
      doc:initialValue,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        keymap.of(defaultKeymap),
        lang(),
        oneDark,
        syntaxHighlighting(defaultHighlightStyle),
        EditorView.updateListener.of((update) => {
          if(update.docChanged){
            saveAndRun()
          }
        })
      ]
    }),
    parent: document.getElementById(parentId)
  })
}

const htmlEditor = createEditor(
  "html-editor",
  html,
  localStorage.getItem("html") || ""
);

const cssEditor = createEditor(
  "css-editor",
  css,
  localStorage.getItem("css") || ""
)

const jsEditor = createEditor(
  "js-editor",
  javascript,
  localStorage.getItem("js") || ""
)

function getCode(editor){
  return editor.state.doc.toString();
}

// run logic

function run(){
  const html = getCode(htmlEditor);
  const css = `<style>${getCode(cssEditor)}</style>`;
  const js = `<script>${getCode(jsEditor)}<\/script>`;
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

function saveAndRun(){
  localStorage.setItem('html', getCode(htmlEditor));
  localStorage.setItem('css', getCode(cssEditor));
  localStorage.setItem('js', getCode(jsEditor));
  debounceRun();
}

function debounceRun(){
  clearTimeout(timeout);
  timeout = setTimeout(run, 250);
}

// tab switch logic
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

// Resize pane logic

let isDragging=false;
const dividerWidth = localStorage.getItem("divider");

if(dividerWidth){
  code.style.width = dividerWidth + "px"
}

divider.addEventListener('mousedown',()=>{
  isDragging=true;
  document.body.style.cursor='col-resize';
  output.style.pointerEvents = "none";
})

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const containerwidth = document.querySelector('.container').offsetWidth;
    const containerRect = document.querySelector('.container').getBoundingClientRect();
  const newCodeWidth = e.clientX - containerRect.left;
  if (newCodeWidth < 150 || newCodeWidth > containerwidth - 150) return;
  code.style.width = newCodeWidth + "px"
  localStorage.setItem("divider", newCodeWidth)
})

document.addEventListener("mouseup", (e)=>{
  isDragging = false;
  document.body.style.cursor = "default";
  output.style.pointerEvents='auto';
})

divider.addEventListener("dblclick", ()=> {
  resetLayout()
})

function resetLayout(){
  const rect = container.getBoundingClientRect();
  const half = rect.width / 2;
  code.style.width = half + 'px';
}

setTimeout(run, 500)
