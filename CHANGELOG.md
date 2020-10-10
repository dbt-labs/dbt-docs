## dbt 0.19.0 (Release TBD)
- Add select/deselect option in DAG view dropups. ([docs#98](https://github.com/fishtown-analytics/dbt-docs/issues/98))
- Fixed issue where sources with tags were not showing up in graph viz ([docs#93](https://github.com/fishtown-analytics/dbt-docs/issues/93))
- Searches no longer require perfect matches, and instead consider each word individually. `my model` or `model my` will now find `my_model`, without the need for underscores ([docs#143](https://github.com/fishtown-analytics/dbt-docs/issues/143))

Contributors:
- [@Mr-Nobody99](https://github.com/Mr-Nobody99) ([docs#138](https://github.com/fishtown-analytics/dbt-docs/pull/138))
- [@jplynch77](https://github.com/jplynch77) ([docs#139](https://github.com/fishtown-analytics/dbt-docs/pull/139))
- [@joellabes](https://github.com/joellabes) ([docs#145](https://github.com/fishtown-analytics/dbt-docs/pull/145))

## dbt 0.18.1 (Unreleased)
- Add Exposure nodes ([docs#135](https://github.com/fishtown-analytics/dbt-docs/issues/135), [docs#136](https://github.com/fishtown-analytics/dbt-docs/pull/136), [docs#137](https://github.com/fishtown-analytics/dbt-docs/pull/137))

## dbt 0.18.0 (September 2, 2020)
- Add project level overviews ([docs#127](https://github.com/fishtown-analytics/dbt-docs/issues/127))

Contributors:
- [@Mr-Nobody99](https://github.com/Mr-Nobody99) ([docs#129](https://github.com/fishtown-analytics/dbt-docs/pull/129))

## dbt 0.18.0rc1 (August 19, 2020)

- Add "Referenced By" and "Depends On" sections for each node ([docs#106](https://github.com/fishtown-analytics/dbt-docs/pull/106))
- Add Name, Description, Column, SQL, Tags filters to site search ([docs#108](https://github.com/fishtown-analytics/dbt-docs/pull/108))
- Add relevance criteria to site search ([docs#113](https://github.com/fishtown-analytics/dbt-docs/pull/113))
- Support new selector methods, intersection, and arbitrary parent/child depth in DAG selection syntax ([docs#118](https://github.com/fishtown-analytics/dbt-docs/pull/118))
- Revise anonymous event tracking: simpler URL fuzzing; differentiate between Cloud-hosted and non-Cloud docs ([docs#121](https://github.com/fishtown-analytics/dbt-docs/pull/121))

Contributors:
- [@stephen8chang](https://github.com/stephen8chang) ([docs#106](https://github.com/fishtown-analytics/dbt-docs/pull/106), [docs#108](https://github.com/fishtown-analytics/dbt-docs/pull/108), [docs#113](https://github.com/fishtown-analytics/dbt-docs/pull/113))
