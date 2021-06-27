export const currentDev = () => {
  localStorage.getItem("yt-dev");
};

export const cycleDev = () => {
  let code = localStorage.getItem("yt-dev");
  code = parseInt(code);
  code = code + 1;
  if (code > 2) code = 0;
  localStorage.setItem("yt-dev", code);
};
