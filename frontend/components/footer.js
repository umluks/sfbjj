document.addEventListener("DOMContentLoaded", function () {
  const footerHTML = `
   <footer>
      <div id="map">
         <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5072.832420402212!2d-47.91979792373563!3d-15.837670624024478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a2559633411ff%3A0x2f13305e10e0dbab!2sPar%C3%B3quia%20Sagrado%20Cora%C3%A7%C3%A3o%20de%20Jesus%20e%20Nossa%20Senhora%20das%20Merc%C3%AAs!5e1!3m2!1spt-PT!2sbr!4v1742238548111!5m2!1spt-PT!2sbr"
            width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"></iframe>
      </div>
      <div id="frase">
         <div class="container text-center">
            <p>#myfaithismyshield</p>
         </div>
      </div>
   </footer>
`;
  document.getElementById("footer").innerHTML = footerHTML;
});
