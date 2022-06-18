/* Check if A-Frame is available */
if (typeof AFRAME === "undefined") {
  throw new Error(
    "Component attempted to register before AFRAME was available."
  );
}

const PROVIDER_LOADERS = {
  "avatar-connect-ready-player-me": function (backpackAvatar, avatarEntity) {
    if (!backpackAvatar.metadata || !backpackAvatar.metadata.outfitGender) {
      console.error("Required metadata is not present");
    }
    const gender =
      backpackAvatar.metadata.outfitGender === "masculine"
        ? "animated-m"
        : "animated-f";
    avatarEntity.setAttribute("rig-animation", {
      remoteId: gender,
      clip: "IDLE",
      loop: "repeat",
      crossFadeDuration: 0.4,
    });
    avatarEntity.setAttribute("backpack-restrict-rotation", { offset: 180 });
  },
  "avatar-connect-crypto-avatars": function (backpackAvatar, avatarEntity) {
    avatarEntity.setAttribute("backpack-restrict-rotation", { offset: 0 });
  },
};

const getBackpackAvatar = async (backpackItemId, backpackBackend) => {
  const jsonUrl = backpackBackend + "/backpack/item/" + backpackItemId;
  const response = await fetch(jsonUrl);
  const backpackItem = await response.json();
  return backpackItem;
};

AFRAME.registerComponent("backpack-avatar", {
  schema: {
    backpackBackend: { default: "", type: "string" },
    backpackItem: { default: "", type: "string" },
    ipfsGateway: { default: "https://nftstorage.link/ipfs", type: "string" },
    avatarModelId: { default: "avatar-model", type: "string" },
    enableWalking: { default: true, type: "boolean" },
  },
  init: async function () {
    const children = this.el.children;
    let findAvatarChild;
    for (let child of children) {
      if (child.id === this.data.avatarModelId) {
        findAvatarChild = child;
        break;
      }
    }

    if (!findAvatarChild) {
      console.error("Avatar child entity can not be found.");
      return;
    }

    this.avatarEntity = findAvatarChild;
    const avatarId = this.data.backpackItem;

    try {
      if (!avatarId) {
        this.setDefaultAvatar();
        return;
      }

      const backpackAvatar = await getBackpackAvatar(
        avatarId,
        this.data.backpackBackend
      );
      if (!backpackAvatar || backpackAvatar.error) {
        this.setDefaultAvatar();
        return;
      }

      const providerLoader = PROVIDER_LOADERS[backpackAvatar.source];
      if (providerLoader) {
        providerLoader.call(this, backpackAvatar, this.avatarEntity);
      }

      this.avatarEntity.setAttribute(
        "gltf-model",
        this.data.ipfsGateway + "/" + backpackAvatar.content
      );
    } catch (error) {
      console.error(error);
      this.setDefaultAvatar();
    }

    if (this.data.enableWalking) {
      this.el.setAttribute("animate-walk");
    }
  },
  setDefaultAvatar: function () {
    this.avatarEntity.setAttribute("gltf-model", "#default-avatar");
    this.avatarEntity.setAttribute("rig-animation", {
      remoteId: "animated-m",
      clip: "IDLE",
      loop: "repeat",
      crossFadeDuration: 0.4,
    });
    this.avatarEntity.setAttribute("backpack-restrict-rotation", {
      offset: 180,
    });
  },
});

AFRAME.registerComponent("backpack-animate-walk", {
  schema: {
    avatarModelId: { default: "avatar-model", type: "string" },
  },
  init: function () {
    this.previousPosition = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
  },
  tick: function (t, dt) {
    var currentPosition = this.el.getAttribute("position");
    var dx = (this.previousPosition.x - currentPosition.x).toFixed(2);
    var dy = (this.previousPosition.y - currentPosition.y).toFixed(2);
    var dz = (this.previousPosition.z - currentPosition.z).toFixed(2);

    this.velocity = {
      x: Math.abs(dx),
      y: Math.abs(dy),
      z: Math.abs(dz),
    };

    const children = this.el.children;
    let findAvatarChild;
    for (let child of children) {
      if (child.id === this.data.avatarModelId) {
        findAvatarChild = child;
        break;
      }
    }

    if (!findAvatarChild) {
      console.error("Avatar child entity can not be found.");
      return;
    }

    var model = findAvatarChild;
    var targetClip = "IDLE";

    if (this.velocity.x + this.velocity.y + this.velocity.z > 0) {
      targetClip = "WALKING";
    }

    if (
      model.getAttribute("rig-animation") &&
      model.getAttribute("rig-animation").clip != targetClip
    ) {
      model.setAttribute("rig-animation", "clip", targetClip);
    }

    this.previousPosition = {
      x: currentPosition.x,
      y: currentPosition.y,
      z: currentPosition.z,
    };
  },
});

AFRAME.registerComponent("backpack-restrict-rotation", {
  schema: {
    offset: { default: 180, type: "number" },
  },
  tick: function (t, dt) {
    const player = document.querySelector("#camera");
    this.el.object3D.rotation.set(
      THREE.Math.degToRad(0),
      THREE.Math.degToRad(this.data.offset) + player.object3D.rotation.y,
      THREE.Math.degToRad(0)
    );
  },
});

AFRAME.registerComponent("backpack-avatar-selector", {
  schema: {
    backpackUrl: { default: "" },
    ipfsGateway: { default: "https://nftstorage.link/ipfs", type: "string" },
    accessToken: { default: "" },
  },
  init: async function () {
    this.selected = null;
    this.avatarEls = [];
    this.textEl = null;

    this.el.emit("backpack:init");
    try {
      const backpackItems = await this.getBackpackItems(this.data.accessToken);
      this.el.emit("backpack:received-items", backpackItems);
      let position = 1;
      for (let backpackItem of backpackItems) {
        const positionString = position + " 0 1";
        const avatarEl = this.createAvatar(
          backpackItem.content,
          positionString,
          "0 -30 0",
          backpackItem.id,
          backpackItem.source
        );
        this.avatarEls.push(avatarEl);
        position = position + 2;
      }

      this.textEl = document.createElement("a-entity");
      this.textEl.setAttribute("text", "value", "Select your avatar");
      this.textEl.setAttribute("text", "width", "10");
      this.textEl.setAttribute("position", "5 2 0");
      this.el.sceneEl.appendChild(this.textEl);
    } catch (error) {
      this.el.emit("backpack:error", error);
    }
  },
  createAvatar: function (cid, position, rotation, id, source) {
    var mainEl = document.createElement("a-entity");
    mainEl.setAttribute("position", position);
    mainEl.setAttribute("rotation", rotation);
    mainEl.setAttribute("cid", cid);

    var avatarEl = document.createElement("a-entity");
    avatarEl.setAttribute("gltf-model", this.data.ipfsGateway + "/" + cid);
    avatarEl.setAttribute("position", "0 0.1 0");

    // Quick fix: Rotate VRM models by 180 degree
    if (source === "avatar-connect-crypto-avatars") {
      avatarEl.setAttribute("rotation", "0 180 0");
    }

    var discEl = document.createElement("a-entity");
    discEl.setAttribute(
      "geometry",
      "primitive: cylinder; height: 0.1; radius: 0.8;"
    );
    discEl.setAttribute(
      "material",
      "color: grey; shader:phong; reflectivity: 100; shininess: 100;"
    );

    mainEl.addEventListener("click", (event) => {
      this.selected = cid;
      this.el.emit("backpack:avatar-selected", id);
      for (let elem of this.avatarEls) {
        if (elem.getAttribute("cid") === cid) {
          elem.children[0].setAttribute("material", "color", "red");
        } else {
          elem.children[0].setAttribute("material", "color", "grey");
        }
      }
    });

    mainEl.addEventListener("mouseenter", (event) => {
      if (mainEl.getAttribute("cid") === this.selected) {
        discEl.setAttribute("material", "color", "red");
      } else {
        discEl.setAttribute("material", "color", "blue");
      }
    });
    mainEl.addEventListener("mouseleave", (event) => {
      if (mainEl.getAttribute("cid") === this.selected) {
        discEl.setAttribute("material", "color", "red");
      } else {
        discEl.setAttribute("material", "color", "grey");
      }
    });

    mainEl.appendChild(discEl);
    mainEl.appendChild(avatarEl);

    this.el.sceneEl.appendChild(mainEl);
    return mainEl;
  },
  removeAvatar(cid) {
    for (avatarEl in this.avatarEls) {
      if (avatarEl.cid === cid) {
        this.el.sceneEl.removeChild(avatarEl);
        this.avatarEls = this.avatarEls.filter((elem) => elem.cid !== cid);
        return avatarEl;
      }
    }
  },
  getBackpackItems: async function (accessToken) {
    const response = await fetch(this.data.backpackUrl + "/backpack/owner", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    });
    const data = await response.json();

    if (data.backpackItems) {
      return data.backpackItems;
    }
    return null;
  },
});

AFRAME.registerComponent("backpack-portal", {
  schema: {
    href: { default: "" },
    image: { type: "asset" },
    title: { default: "" },
    titleColor: { default: "white", type: "color" },
  },

  init: function () {
    this.selectedAvatar = "";
    this.initVisualAspect();
  },
  play: function () {
    this.updateEventListener();
  },
  pause: function () {
    this.removeEventListener();
  },
  updateEventListener: function () {
    var el = this.el;
    if (!el.isPlaying) {
      return;
    }
    this.el.addEventListener("click", this.navigate.bind(this));
    document.addEventListener(
      "backpack:avatar-selected",
      this.selectAvatar.bind(this)
    );
  },
  removeEventListener: function () {
    this.el.removeEventListener("click", this.navigate.bind(this));
    document.removeEventListener(
      "backpack:avatar-selected",
      this.selectAvatar.bind(this)
    );
  },
  initVisualAspect: function () {
    if (this.visualAspectInitialized) {
      return;
    }

    var textEl = this.textEl || document.createElement("a-entity");

    this.el.setAttribute("geometry", {
      primitive: "circle",
      radius: 1.0,
      segments: 64,
    });
    this.el.setAttribute("material", {
      shader: "backpack-portal-shader",
      pano: this.data.image,
      side: "double",
    });

    textEl.setAttribute("text", {
      color: this.data.titleColor,
      align: "center",
      value: this.data.title || this.data.href,
      width: 4,
    });
    textEl.setAttribute("position", "0 1.5 0");
    this.el.appendChild(textEl);

    this.visualAspectInitialized = true;
  },
  navigate: function (event) {
    window.location = this.data.href + "?avatar=" + this.selectedAvatar;
  },
  selectAvatar: function (event) {
    this.selectedAvatar = event.detail;
  },
  remove: function () {
    this.removeEventListener();
  },
});

/* eslint-disable */
AFRAME.registerShader("backpack-portal-shader", {
  schema: {
    borderEnabled: { default: 1.0, type: "int", is: "uniform" },
    backgroundColor: { default: "grey", type: "color", is: "uniform" },
    pano: { type: "map", is: "uniform" },
    strokeColor: { default: "white", type: "color", is: "uniform" },
  },

  vertexShader: [
    "vec3 portalPosition;",
    "varying vec3 vWorldPosition;",
    "varying float vDistanceToCenter;",
    "varying float vDistance;",
    "void main() {",
    "vDistanceToCenter = clamp(length(position - vec3(0.0, 0.0, 0.0)), 0.0, 1.0);",
    "portalPosition = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;",
    "vDistance = length(portalPosition - cameraPosition);",
    "vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
    "}",
  ].join("\n"),

  fragmentShader: [
    "#define RECIPROCAL_PI2 0.15915494",
    "uniform sampler2D pano;",
    "uniform vec3 strokeColor;",
    "uniform vec3 backgroundColor;",
    "uniform float borderEnabled;",
    "varying float vDistanceToCenter;",
    "varying float vDistance;",
    "varying vec3 vWorldPosition;",
    "void main() {",
    "vec3 direction = normalize(vWorldPosition - cameraPosition);",
    "vec2 sampleUV;",
    "float borderThickness = clamp(exp(-vDistance / 50.0), 0.6, 0.95);",
    "sampleUV.y = clamp(direction.y * 0.5  + 0.5, 0.0, 1.0);",
    "sampleUV.x = atan(direction.z, -direction.x) * -RECIPROCAL_PI2 + 0.5;",
    "if (vDistanceToCenter > borderThickness && borderEnabled == 1.0) {",
    "gl_FragColor = vec4(strokeColor, 1.0);",
    "} else {",
    "gl_FragColor = mix(texture2D(pano, sampleUV), vec4(backgroundColor, 1.0), clamp(pow((vDistance / 15.0), 2.0), 0.0, 1.0));",
    "}",
    "}",
  ].join("\n"),
});
/* eslint-enable */

/* Experimental rig component for RPM avatar */

const LoopMode = {
  once: THREE.LoopOnce,
  repeat: THREE.LoopRepeat,
  pingpong: THREE.LoopPingPong,
};

function wildcardToRegExp(s) {
  return new RegExp(`^${s.split(/\*+/).map(regExpEscape).join(".*")}$`);
}

function regExpEscape(s) {
  return s.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}

AFRAME.registerComponent("rig-animation", {
  schema: {
    remoteId: {
      default: "animated",
      type: "string",
    },
    clip: {
      default: "*",
      type: "string",
    },
    duration: {
      default: 0,
      type: "number",
    },
    clampWhenFinished: {
      default: !1,
      type: "boolean",
    },
    crossFadeDuration: {
      default: 0,
      type: "number",
    },
    loop: {
      default: "repeat",
      oneOf: Object.keys(LoopMode),
    },
    repetitions: {
      default: 1 / 0,
      min: 0,
    },
    timeScale: {
      default: 1,
    },
  },
  init() {
    (this.model = null),
      (this.remoteModel = null),
      (this.mixer = null),
      (this.activeActions = []);
    let { remoteId } = this.data;
    remoteId = remoteId.charAt(0) === "#" ? remoteId.slice(1) : remoteId;
    const remoteEl = document.getElementById(remoteId);
    remoteEl ||
      console.error(
        "ramx: Remote entity not found. Pass the ID of the entity, not the model."
      ),
      (this.model = this.el.getObject3D("mesh")),
      (this.remoteModel = remoteEl.getObject3D("mesh"));
    const tryToLoad = () => {
      this.model && this.remoteModel && this.load();
    };
    this.model
      ? tryToLoad()
      : this.el.addEventListener("model-loaded", (e) => {
          (this.model = e.detail.model), tryToLoad();
        }),
      this.remoteModel
        ? tryToLoad()
        : remoteEl.addEventListener("model-loaded", (e) => {
            (this.remoteModel = e.detail.model), tryToLoad();
          });
  },
  load() {
    const { el } = this;
    (this.model.animations = [...this.remoteModel.animations]),
      (this.mixer = new THREE.AnimationMixer(this.model)),
      this.mixer.addEventListener("loop", (e) => {
        el.emit("animation-loop", {
          action: e.action,
          loopDelta: e.loopDelta,
        });
      }),
      this.mixer.addEventListener("finished", (e) => {
        el.emit("animation-finished", {
          action: e.action,
          direction: e.direction,
        });
      }),
      this.data.clip && this.update({});
  },
  remove() {
    this.mixer && this.mixer.stopAllAction();
  },
  update(prevData) {
    if (!prevData) return;
    const { data } = this;
    const changes = AFRAME.utils.diff(data, prevData);
    if ("clip" in changes) {
      return this.stopAction(), void (data.clip && this.playAction());
    }
    this.activeActions.forEach((action) => {
      "duration" in changes &&
        data.duration &&
        action.setDuration(data.duration),
        "clampWhenFinished" in changes &&
          (action.clampWhenFinished = data.clampWhenFinished),
        ("loop" in changes || "repetitions" in changes) &&
          action.setLoop(LoopMode[data.loop], data.repetitions),
        "timeScale" in changes && action.setEffectiveTimeScale(data.timeScale);
    });
  },
  stopAction() {
    const { data } = this;
    for (let i = 0; i < this.activeActions.length; i++)
      data.crossFadeDuration
        ? this.activeActions[i].fadeOut(data.crossFadeDuration)
        : this.activeActions[i].stop();
    this.activeActions = [];
  },
  playAction() {
    if (!this.mixer) return;
    const { model } = this;
    const { data } = this;
    const clips = model.animations || (model.geometry || {}).animations || [];
    if (!clips.length) return;
    const re = wildcardToRegExp(data.clip);
    for (let clip, i = 0; (clip = clips[i]); i++) {
      if (clip.name.match(re)) {
        const action = this.mixer.clipAction(clip, model);
        (action.enabled = !0),
          (action.clampWhenFinished = data.clampWhenFinished),
          data.duration && action.setDuration(data.duration),
          data.timeScale !== 1 && action.setEffectiveTimeScale(data.timeScale),
          action
            .setLoop(LoopMode[data.loop], data.repetitions)
            .fadeIn(data.crossFadeDuration)
            .play(),
          this.activeActions.push(action);
      }
    }
  },
  tick(t, dt) {
    this.mixer && !Number.isNaN(dt) && this.mixer.update(dt / 1e3);
  },
});
