# StoreGenerator agent instructions

This checkout contains the standalone StoreGenerator application. Confirm the
target runtime before changing it. DungeonMindServer also has StoreGenerator
routes, and the umbrella repository has a separate Compose build context for
this checkout.

Use the [Dockerfile](Dockerfile) as the standalone container entry point.
For a runtime change, build the image and verify the affected route with
disposable inputs. Confirm the owning deployment before changing shared
configuration, credentials, or service wiring.
