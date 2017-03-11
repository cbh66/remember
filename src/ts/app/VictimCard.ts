/// <reference path="../lib/victim.d.ts" />
import * as $ from "jquery";

interface MemorialFields {
    name: JQuery;
    years: JQuery;
    event: JQuery;
    details: JQuery;
}

export default class VictimCard {
    protected victim: Victim|null;
    protected memorial: JQuery;

    protected fields: MemorialFields;

    constructor(public memorialContainer: JQuery) {
        let name = $("div", { id: "name" });
        let years = $("div", { id: "years" });
        let event = $("div", { id: "event" });
        let details = $("div", { id: "facts" });
        this.fields = { name, years, event, details };
        this.memorial = $("div", { id: "memorial" });
        this.memorial.append(name, years, event, details);
        this.memorial.appendTo(memorialContainer);
        $(window).on('resize', function () {
            this.verticallyCenter(this.memorial, this.memorialContainer);
        });
    };

    public setVictim(victim: Victim) {
        this.victim = victim;
        this.updateMemorial(victim);
    }

    public verticallyCenter(inner: JQuery, container: JQuery): void  {
        let inHeight = inner.outerHeight();
        let conHeight = container.outerHeight();
        inner.css('margin-top', ((conHeight-inHeight)/2)+'px');
    }

    protected updateMemorial(victim: Victim): void {
        let { name, years, event, details } = this.fields;
        name.html(victim.name || "");
        if (victim.birthYear || victim.deathYear) {
            years.html((victim.birthYear || "?") + " - " +
                       (victim.deathYear || "?"));
        } else {
            years.html("")
        }
        event.html(victim.event || "");
        details.html(victim.details || "");

        this.verticallyCenter(this.memorial, this.memorialContainer);
    }
};
