export default () => {
    let tab_selects = [...document.querySelectorAll(".tab_select")];
    tab_selects.forEach(tab_select => {
        tab_select.addEventListener('click', (ev) => {
            if(!tab_select.hasAttribute("active")){
                tab_selects.find(ts => ts.hasAttribute("active")).removeAttribute("active");
                [...document.querySelectorAll(".tab")].find(tab => tab.hasAttribute("active")).removeAttribute("active");

                tab_select.setAttribute("active", "true");
                document.querySelector(tab_select.getAttribute("data-tab")).setAttribute("active", "true");
            }
        })
    });
}