export function displayNoCookiesInfo() {
    if (!document.body) return;

    let noCookieMsg = document.createElement('img');
    noCookieMsg.src = 'icons/noCookieIconSVG.svg';
    noCookieMsg.style.height = '95vh';

    noCookieMsg.addEventListener('click', () => {
        location.href = 'https://GustavGroenborg.github.io/P2';
    });

    let newBody = document.createElement('body');
    newBody.style.display = 'flex';
    newBody.style.justifyContent = 'center';
    newBody.style.backgroundColor = 'aliceblue';

    let newHead = document.createElement('head');
    newHead.innerHTML += `<!-- This website was made by Gustav C. R. Grønborg as a part of the semester project on the second semester of Computer Science at AAU Department of Computer Science. Please contact me at gcrg21@student.aau.dk, if you have any questions.
(c) 2022 Gustav Christian Risager Grønborg -->

<title> AAU P2 project</title>`;

    document.querySelector('html')!.appendChild(newHead);
    document.querySelector('html')!.appendChild(newBody);
    document.querySelector('body')!.appendChild(noCookieMsg);
}


export function cookiePopup() {
    // Hiding the controls.
    const menuPane = document.querySelector('#menuPane') as HTMLElement;
    const mapControls = document.querySelector('#mapControlsContainer') as HTMLElement;
    const mapv1 = document.querySelector('#mapv1') as HTMLElement;
    
    if (menuPane) menuPane.style.display = 'none';
    if (mapControls) mapControls.style.display = 'none';
    if (mapv1) mapv1.style.display = 'none';

    // Adding the cookie message.
    let cookieContainer = document.querySelector('#cookieContainer');
    if (!cookieContainer) return;
    
    let cookieMsg = document.createElement('div');
    let choiceContainer = document.createElement('div');
    let cookieNo = document.createElement('div');
    let cookieYes = document.createElement('div');

    // Configuring the cookie message.
    cookieMsg.id = 'cookieMsg';
    cookieMsg.className = 'menuPaneStyle';
    cookieMsg.style.fontSize = '2em';
    cookieMsg.innerHTML = `Denne hjemmeside, bruges til at udvikle senaturen.dk. ` +
        `Der samles derfor data om dit besøg gennem Google Analytics. ` +
        `Jeg skal udelukkende bruge dataene til at måle hvilke funktioner der er populære, ` +
        `samt at se hvor mange besøgende der er. ` +
        `<br>Der bliver målt følgende ting:\n` +
        `   <br> <ol> <li>Sidevisninger </li>` +
        `   <br> <li>Udgående klik\n` +
        `       <ul><li>Dette er når du klikker på et link, på denne hjemmeside, som medfører, at du forlader hjemmesiden.</li></ul></li>\n` +
        `   <br> <li>Fildownloads\n` +
        `      <ul><li>Det registreres, hver gang du downloader en fil fra denne hjemmeside.</li></ul></li>\n`;

    // Configuring the yes button.
    cookieYes.id = 'cookieYes';
    cookieYes.innerHTML = 'I consent to cookies'
    cookieYes.className = 'cookieChoice';

    // Configuring the no button.
    cookieNo.id = 'cookieNo';
    cookieNo.innerHTML = 'I DO NOT consent to cookies'
    cookieNo.className = 'cookieChoice';

    // Setting the id of the choice container.
    choiceContainer.id = 'choiceContainer';

    // Assembling everything
    cookieContainer.appendChild(cookieMsg);
    choiceContainer.appendChild(cookieNo);
    choiceContainer.appendChild(cookieYes);
    cookieContainer.appendChild(choiceContainer);

    // Adding the necessary event listeners.
    cookieNo.addEventListener('click', () => {
        cookieNo.style.scale = '95%';
        // Deleting everything.
        document.head.remove();
        document.body.remove();
        setTimeout(displayNoCookiesInfo, 5);

    });

    cookieYes.addEventListener('click', () => {
        cookieYes.style.scale = '95%';

        document.querySelector('#cookiePopup')?.remove();

        // Showing the map.
        if (menuPane) menuPane.style.removeProperty('display');
        if (mapControls) mapControls.style.removeProperty('display');
        if (mapv1) mapv1.style.removeProperty('display');

        // Adding Google Analytics.
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]){(window as any).dataLayer.push(args);}
        gtag('js', new Date());

        gtag('config', 'G-L0LV3E81BK');
    });

}
