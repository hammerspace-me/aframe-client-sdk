# @metaverse-backpack/backpack-aframe-client-sdk

## About the project

A collection of components to integrate [Backpack](https://docs.metabag.dev) into your [A-Frame](https://aframe.io) project. Backpack is an open-source, virtual backpack for the Metaverse.

## Getting started

### Prerequisites

- npm

  Install npm as this project uses npm as a package manager. _NOTE:_ This installation command requires [brew](https://brew.sh/) and only runs on Mac.

  ```sh
  $ brew install node
  ```

### Installation

1. Clone the repo
   ```sh
   $ git clone https://github.com/Metaverse-Backpack/backpack-aframe-client-sdk.git
   ```
2. Install NPM packages
   ```sh
   $ npm install
   ```

## Usage

### Integrate in your existing A-Frame project

To integrate the Backpack A-Frame components into your existing project, add the following dependencies in your `<head>` tag underneath your A-Frame import.

```html
<script src="https://cdn.jsdelivr.net/npm/@metaverse-backpack/backpack-aframe-client-sdk/dist/backpack-aframe-client-sdk.min.js"></script>
```

There are various A-Frame components with different purposes:

| Component                | Purpose                                                                                                                                           | Status                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| backpack-avatar-selector | Automatically creates a room with all your avatars and provides a selection mechanism                                                             | Draft, Tied to Meditation PoC demonstrator |
| backpack-portal          | Portal that automatically listens to the events from backpack-avatar-selector and takes the selected avatar as query parameter to the portal link | Draft, Tied to Meditation PoC demonstrator |
| backpack-avatar          | Component that automatically loads an avatar from the backpack by providing the backpack item ID                                                  | Draft, Tied to Meditation PoC demonstrator |

### Directly use this project

#### Development

For development, the Backpack A-Frame components can be seen in various examples by starting a local webserver:

```bash
# Start development webserver in watch mode (automatically reload if files change)
$ npm run start
```

Navigate to `http://localhost:9000` to choose one of the examples.

##### Examples

1. Basic example of an avatar selection room based on Backpack
2. Basic example of loading an avatar from the Backpack

#### Production

For production, the Backpack A-Frame components can be built and minified with the following command:

```bash
# Build component in production
$ npm run dist
```

It builds the components for production to the `dist` folder. It contains a minified and non-minified version.

### Custom provider modules

Each avatar provider can provide a custom module to extend the generalized functionality of the `backpack-avatar` component. E.g., use different rigging for different providers as their bone structure differs from each other. Feel free to contribute your very own provider module, please check [Contributing](#contributing) for further instructions. A provider module is a function that receives the Avatar element `avatarEl` as a parameter and additionally gets access to the context of the component bind to `this`, specifically to `this.data`. To illustrate, here is an example adding a custom idle animation to ReadyPlayerMe avatars by using the rig-animation component:

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

## Related projects

- [Backpack](https://github.com/Metaverse-Backpack)

## Contact

Benedikt Wölk - [@web3woelk](https://twitter.com/web3woelk) - benedikt.woelk@protocol.ai

Tobias Petrasch - [@TPetrasch](https://twitter.com/TPetrasch) - tobias.petrasch@protocol.ai

## Acknowledgments

- [Protocol Labs](https://www.protocol.ai)
