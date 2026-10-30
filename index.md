---
layout: home
title: Home
---

<div class="home-layout">
  <div class="home-row home-row-top">
    <div class="home-card visual-card">
      <div class="visual-frame">
        <img src="{{ '/assets/dp.png' | relative_url }}" alt="dynamic programming visual" />
      </div>
    </div>

    <div class="home-card intro-card">
      <h1>/home</h1>
      <p>
        I am a software engineer specialising in full-stack development,
        cloud architecture, AI engineering, and developer tooling.
        I build applications, backend integrations, and automation,
        drawing on a background in infrastructure engineering
        and production reliability.
      </p>

      <div class="social">
        <a href="https://github.com/gLuColte" aria-label="GitHub">github</a>
        <span>·</span>
        <a href="https://www.linkedin.com/in/garylu-2021/" aria-label="LinkedIn">linkedin</a>
      </div>
    </div>
  </div>

  <div class="home-row home-row-bottom">
    <div class="home-card achievements-card">
      <h2>achievements</h2>
      <ul class="list">
        <li>Built a developer environment integrating Kiro CLI, MCP, tmux, and AI agents</li>
        <li>Developed a TypeScript MCP server exposing internal APIs to AI agents with safeguards on write operations</li>
        <li>Built and deployed an internal BI platform using Redshift Serverless, DynamoDB, and QuickSight</li>
        <li>Designed AWS CDK infrastructure with automated database credential rotation</li>
        <li>Introduced Amazon Q diagnostics, reducing root cause analysis from hours to minutes</li>
        <li>Built CI/CD deployment patterns aligned with application security requirements</li>
        <li>Designed a proof-of-concept service portal for regional engineering workflows</li>
        <li>Built an AI-assisted triage dashboard, reducing triage time from 20 to under 5 minutes</li>
        <li>Integrated New Relic, OpenSearch, Elastic Stack, and CloudWatch for monitoring and diagnostics</li>
        <li>Automated infrastructure and releases with Terraform, Jenkins, Octopus Deploy, and Docker</li>
        <li>Supported CVAT migration from an Azure VM to Amazon EC2</li>
        <li>Built Python tools for data processing, validation, and annotation review</li>
      </ul>
    </div>

    <div class="home-card skills-card">
      <section class="home-section" aria-labelledby="certifications-title">
        <h2 id="certifications-title">certifications</h2>
        <ul class="skills">
          <li>AWS Certified GenAI Developer - Professional</li>
          <li>AWS Certified Solutions Architect - Professional</li>
          <li>AWS Certified Solutions Architect - Associate</li>
        </ul>
      </section>

      <h2>key skills</h2>
      <div class="skill-group">
        <h3>💻 Software Engineering</h3>
        <ul class="skills">
          <li>Python application development</li>
          <li>TypeScript backend services</li>
          <li>REST APIs and backend integration</li>
          <li>Frontend and backend development</li>
        </ul>
      </div>

      <div class="skill-group">
        <h3>🤖 AI Developer Tooling</h3>
        <ul class="skills">
          <li>MCP server development</li>
          <li>Kiro CLI and tmux</li>
          <li>AI agent tool integration</li>
          <li>Amazon Q diagnostics</li>
        </ul>
      </div>

      <div class="skill-group">
        <h3>☁️ Cloud Architecture</h3>
        <ul class="skills">
          <li>AWS application architecture</li>
          <li>Microsoft Azure infrastructure</li>
          <li>Redshift and DynamoDB</li>
          <li>QuickSight dashboards</li>
        </ul>
      </div>

      <div class="skill-group">
        <h3>⚙️ Infrastructure &amp; Delivery</h3>
        <ul class="skills">
          <li>AWS CDK and Terraform</li>
          <li>CI/CD pipeline development</li>
          <li>Docker containers</li>
          <li>Jenkins and Octopus Deploy</li>
        </ul>
      </div>

      <div class="skill-group">
        <h3>📈 Observability &amp; Reliability</h3>
        <ul class="skills">
          <li>Root cause analysis</li>
          <li>CloudWatch metrics</li>
          <li>OpenSearch and Elastic Stack</li>
          <li>New Relic monitoring</li>
        </ul>
      </div>

      <div class="skill-group">
        <h3>🖥️ Systems &amp; Operations</h3>
        <ul class="skills">
          <li>Linux and Ubuntu administration</li>
          <li>Shell and Python automation</li>
          <li>Production readiness</li>
          <li>Cloud cost optimisation</li>
        </ul>
      </div>

    </div>
  </div>
</div>
