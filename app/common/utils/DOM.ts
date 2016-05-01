export class DOMHelper {
    public static scrollTo(elt: any, offset?: number): void {
        if(elt) {
            const parentScroll = this.parents(elt, 'scroll-content');
            if(parentScroll) {
                const top = elt.getBoundingClientRect().top;
                parentScroll.scrollTop += top + (offset || 0);
            }
        }
    }
    public static parents(elt: any, selector: string): any {
        if(!elt) return null;
        if(this.matchSelector(elt, selector)) return elt;
        if(this.matchSelector(elt, 'html')) return null;
        return this.parents(elt.parentElement, selector);
    }
    public static matchSelector(elt: any, selector: string): boolean {
        if(!elt || !selector) return false;
        if(selector.startsWith('.')) return elt.classList.contains(selector.slice(1));
        if(selector.startsWith('#')) return elt.id === selector.slice(1);
        return elt.tagName === selector.toUpperCase();
    }
}