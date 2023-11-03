# Why this exists

Summonerd's web environment is extremely barebones by design, so you don't have access to the niceties
of usual dev envs, like being able to use CSS frameworks like tailwind, or hot reloading, and all that jazz.
This is a nicer dev environment to tinker around with before producing static files summonerd can use.

# Running

This command runs the build system.

```
npx parcel src/index.html
```

The output will be in dist, and somewhat mangled, so it's a bit annoying to copy it over to the final prod
environment for the summoner.
