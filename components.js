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
        <pre class="code-block"><code><span class="comment">// photographer wannabe</span>
<span class="keyword">const</span> subject = <span class="string">"whatever is on my sight";</span>
<span class="keyword">const</span> filters = <span class="string">["graininess", "vignette", "exposure", "contrast"];</span>
<span class="function">render</span>(<span class="function">vibrance</span>(<span class="keyword">subject, filters</span>));</code></pre>
<pre class="code-block"><code><span class="comment">// download to get full quality picture</span>
            `;
    }
}

customElements.define('collection-intro', collectionIntro);
