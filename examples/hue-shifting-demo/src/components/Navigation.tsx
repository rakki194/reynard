import { Component } from "solid-js";
import { A } from "@solidjs/router";
import { allIcons } from "reynard-fluent-icons";
import "./Navigation.css";

export const Navigation: Component = () => {
  return (
    <nav class="navigation">
      <div class="nav-brand">
        <h1>
          <span innerHTML={allIcons.cat.svg}></span>
          OKLCH Hue Shifting Demo
        </h1>
      </div>
      <div class="nav-links">
        <A href="/" activeClass="active" end={true}>
          Overview
        </A>
        <A href="/editor" activeClass="active">
          Pixel Editor
        </A>
        <A href="/materials" activeClass="active">
          Materials
        </A>
        <A href="/performance" activeClass="active">
          Performance
        </A>
      </div>
    </nav>
  );
};
