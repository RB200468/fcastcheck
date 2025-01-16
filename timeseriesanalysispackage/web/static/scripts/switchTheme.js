const theme_icon = document.getElementById('theme-icon');

/* Dark Colors */
const bg_color_1_dark = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-1-dark').trim();
const bg_color_2_dark = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-2-dark').trim();
const txt_color_1_dark = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1-dark').trim();
const txt_color_2_dark = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-2-dark').trim();

/* Light Colors */
const bg_color_1_light = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-1-light').trim();
const bg_color_2_light = getComputedStyle(document.documentElement).getPropertyValue('--bg-color-2-light').trim();
const txt_color_1_light = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-1-light').trim();
const txt_color_2_light = getComputedStyle(document.documentElement).getPropertyValue('--txt-color-2-light').trim();

function changeTheme() {
    if (theme_icon.classList.contains('bxs-sun')) {
        /* Change to Dark */
        theme_icon.classList.replace('bxs-sun', 'bxs-moon');
        document.documentElement.style.setProperty('--bg-color-1', bg_color_1_dark);
        document.documentElement.style.setProperty('--bg-color-2', bg_color_2_dark);
        document.documentElement.style.setProperty('--txt-color-1', txt_color_1_dark);
        document.documentElement.style.setProperty('--txt-color-2', txt_color_2_dark);
        
        /* Change Chart Dark */
        window.myChart.options.scales.x.ticks.color = txt_color_1_dark;
        window.myChart.options.scales.y.ticks.color = txt_color_1_dark;
        window.myChart.options.scales.x.border.color = txt_color_1_dark;
        window.myChart.options.scales.y.border.color = txt_color_1_dark;
        window.myChart.options.scales.y.title.color = txt_color_1_dark;
        window.myChart.options.plugins.legend.labels.color = txt_color_1_dark;

    } else if (theme_icon.classList.contains('bxs-moon')) {
        /* Change to Light */
        theme_icon.classList.replace('bxs-moon', 'bxs-sun');
        document.documentElement.style.setProperty('--bg-color-1', bg_color_1_light);
        document.documentElement.style.setProperty('--bg-color-2', bg_color_2_light);
        document.documentElement.style.setProperty('--txt-color-1', txt_color_1_light);
        document.documentElement.style.setProperty('--txt-color-2', txt_color_2_light);
        
        /* Change Chart Light */
        window.myChart.options.scales.x.ticks.color = txt_color_1_light;
        window.myChart.options.scales.y.ticks.color = txt_color_1_light;
        window.myChart.options.scales.x.border.color = txt_color_1_light;
        window.myChart.options.scales.y.border.color = txt_color_1_light;
        window.myChart.options.scales.y.title.color = txt_color_1_light;
        window.myChart.options.plugins.legend.labels.color = txt_color_1_light;
    }
    window.myChart.update();
};