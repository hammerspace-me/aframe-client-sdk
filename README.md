# hammerspace-me/aframe-client-sdk

## About the project

Hammerspace is a virtual space for all the assets that belong to you. It helps you move and express yourself in the Metaverse. Hammerspace's focus is to enable interoperability and seamlessness. This SDK provides a collection of components to integrate Hammerspace into your [A-Frame](https://aframe.io) project. Feel free to visit the project website or our E2E demo.

## Getting started

### Prerequisites

-   npm

    Install npm as this project uses npm as a package manager. _NOTE:_ This installation command requires [brew](https://brew.sh/) and only runs on Mac.

    ```sh
    $ brew install node
    ```

### Installation

1. Clone the repo
    ```sh
    $ git clone https://github.com/hammerspace-me/aframe-client-sdk.git
    ```
2. Install NPM packages
    ```sh
    $ npm install
    ```

## Usage

### Integrate in your existing A-Frame project

To integrate the Hammerspace A-Frame components into your existing project, add the following dependencies in your `<head>` tag underneath your A-Frame import.

```html
<script src="https://cdn.jsdelivr.net/npm/@hammerspace-me/aframe-client-sdk/dist/aframe-client-sdk.min.js"></script>
```

There are various A-Frame components with different purposes:

| Component                   | Purpose                                                                                                                                              | Status              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| hammerspace-avatar-selector | Automatically creates a room with all your avatars and provides a selection mechanism                                                                | Early, Experimental |
| hammerspace-portal          | Portal that automatically listens to the events from hammerspace-avatar-selector and takes the selected avatar as query parameter to the portal link | Early, Experimental |
| hammerspace-avatar          | Component that automatically loads an avatar from Hammerspace by providing the item ID                                                               | Early, Experimental |

### Directly use this project

#### Development

For development, the Hammerspace A-Frame components can be experienced in various examples by starting a local webserver:

```bash
# Start development webserver in watch mode (automatically reload if files change)
$ npm run start
```

Navigate to `http://localhost:9000` to choose one of the examples.

##### Basic example of the avatar selector component

The example requires a Hammerspace with avatars stored in it. To start adding avatars to a Hammerspace, visit the official [frontend](https://frontend.hammerspace.me). Login with Metamask. Click on "Add item" and select one of the avatar providers (e.g., Ready Player Me). Follow the instructions of the avatar provider to upload the avatar to Hammerspace. If everything worked fine, the main page of Hammerspace should show a preview of the avatar.

The example redirects the user to the OAuth flow to ask for permission to the avatars. The user is required to follow the instructions and grant access to its personal Hammerspace. If access is granted, the user is redirected back to the example and the avatar selector displays the avatars of the Hammerspace.

#### Production

For production, the Hammerspace A-Frame components can be built and minified with the following command:

```bash
# Build component in production
$ npm run dist
```

It builds the components for production to the `dist` folder. It contains a minified and non-minified version.

### Custom provider modules

Each avatar provider can provide a custom module to extend the generalized functionality of the `hammerspace-avatar` component. E.g., use different rigging for different providers as their bone structure differs from each other. Feel free to contribute your very own provider module, please check [Contributing](#contributing) for further instructions. A provider module is a function that receives the Avatar element `avatarEl` as a parameter and additionally gets access to the context of the component bind to `this`, specifically to `this.data`. To illustrate, here is an example adding a custom idle animation to ReadyPlayerMe avatars by using the rig-animation component:

```javascript
const PROVIDER_LOADERS = {
    "ready-player-me": function (avatarEl) {
        avatarEl.setAttribute("rig-animation", {
            remoteId:
                this.data.metadata.outfitGender === "masculine"
                    ? "animated-m"
                    : "animated-f",
            clip: "IDLE",
            loop: "repeat",
            crossFadeDuration: 0,
        });
    },
};
```

## Known issues

-   Vulnerability alert when installing dependencies: There are a few vulnerabilities detected when running `npm install`. We are aware of the issue, but can not resolve it at the moment. The vulnerabilities are part of A-Frame, specifically in dependencies of A-Frame, that have not been fixed by A-Frame yet. We will update A-Frame to the latest version as soon as they release a new version. Keep in mind that A-Frame is a dev dependency only, the vulnerable code will not be shipped with our SDK.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your Changes (`git commit -m 'add some amazing feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

## Contact

Benedikt Wölk - [@web3woelk](https://twitter.com/web3woelk) - benedikt.woelk@protocol.ai

Tobias Petrasch - [@TPetrasch](https://twitter.com/TPetrasch) - tobias.petrasch@protocol.ai

## Acknowledgments

-   [Protocol Labs](https://www.protocol.ai)
