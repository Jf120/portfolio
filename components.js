class AppNavbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav>
                <a href="index.html" style="color: white; margin-right: 10px;">About Me</a>
                <a href="photos.html" style="color: white;">Photos</a>
            </nav>
            `;
        }
}

// Define the custom element
customElements.define('app-navbar', AppNavbar);

class collectionIntro extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `    
        <pre class="code-block"><code><span class="comment">// autumn compiled</span>
<span class="keyword">const</span> subject = <span class="string">"fall";</span>
<span class="keyword">const</span> details = <span class="string">["amber", "crimson", "gold"];</span>
<span class="function">render</span>(<span class="function">vignette</span>(<span class="keyword">subject, details</span>));</code></pre>
            `;
        }
}

customElements.define('collection-intro', collectionIntro);
