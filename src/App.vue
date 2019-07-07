<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* snippets from normalize.css */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "PT Sans", sans-serif;
}

button,
input,
optgroup,
select,
textarea {
  font-family: inherit; /* 1 */
  font-size: 100%; /* 1 */
  line-height: 1.15; /* 1 */
  margin: 0; /* 2 */
}

button::-moz-focus-inner,
[type="button"]::-moz-focus-inner,
[type="reset"]::-moz-focus-inner,
[type="submit"]::-moz-focus-inner {
  border-style: none;
  padding: 0;
}

button:-moz-focusring,
[type="button"]:-moz-focusring,
[type="reset"]:-moz-focusring,
[type="submit"]:-moz-focusring {
  outline: 1px dotted ButtonText;
}

select {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 3px;
  padding: 3px 22px 3px 3px;
  background-image: url("data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M7.406 7.828l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z'%3E%3C/path%3E%3C/svg%3E");
  background-position: calc(100% - 3px) 50%;
  background-repeat: no-repeat;
  background-size: 16px;
  -webkit-appearance: none;
  -moz-appearance: none;
}
select::-ms-expand {
  display: none;
}

[type="search"] {
  -webkit-appearance: textfield; /* 1 */
  outline-offset: -2px; /* 2 */
}

[hidden] {
  display: none;
}

.grid {
  display: grid;
  grid-template-columns: 33fr 33fr 33fr;
  grid-template-rows: 9vh 6vh 28vh 28vh 28vh;
}

button,
.button {
  display: block;
  outline: 0;
  background-color: #0080ff;
  margin: 3%;
  color: #fff;
  font-size: 2em;
  text-align: center;
  padding: 0.5em;
  cursor: hand;
  cursor: pointer;
  border: none;
}

button:hover {
  background-color: #0066cc;
}

button.header {
  font-size: 2em;
  padding-top: 0.5em;
}

button.spacer {
  background-color: transparent;
  color: #000;
  cursor: initial;
  padding: 0;
  font-size: 2em;
}

.red {
  background-color: #ff0000;
}

.red:hover {
  background-color: #b20000;
}

.purple {
  background-color: #e100c1;
}

.purple:hover {
  background-color: rebeccapurple;
}
</style>
