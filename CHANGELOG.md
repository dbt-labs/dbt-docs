## dbt-core 1.0.1 (TBD)

- Fix bug with missing exposure details. ([docs#228](https://github.com/dbt-labs/dbt-docs/pull/228))

## dbt-core 1.0.0rc1 (November 10, 2021)

- Fix non-alphabetical sort of Source Tables in source overview page ([docs#81](https://github.com/dbt-labs/dbt-docs/issues/81), [docs#218](https://github.com/dbt-labs/dbt-docs/pull/218))
- Add title tag to node elements in tree ([docs#202](https://github.com/dbt-labs/dbt-docs/issues/202), [docs#203](https://github.com/dbt-labs/dbt-docs/pull/203))
- Account for test rename: `schema` &rarr; `generic`, `data` &rarr;` singular`. Use `test_metadata` instead of `schema`/`data` tags to differentiate ([docs#216](https://github.com/dbt-labs/dbt-docs/issues/216), [docs#222](https://github.com/dbt-labs/dbt-docs/pull/222))
- Add metrics ([core#216](https://github.com/dbt-labs/dbt-core/issues/4235), [docs#223](https://github.com/dbt-labs/dbt-docs/pull/223))

Contributors:
- [@salmonsd](https://github.com/salmonsd) ([docs#218](https://github.com/dbt-labs/dbt-docs/pull/218))
- [@miike](https://github.com/miike) ([docs#203](https://github.com/dbt-labs/dbt-docs/pull/203))

## dbt 0.20.1rc1 (August 02, 2021)

- Fix docs site crash if `relationships` test has one dependency instead of two ([docs#207](https://github.com/dbt-labs/dbt-docs/issues/207), ([docs#208](https://github.com/dbt-labs/dbt-docs/issues/208)))

## dbt 0.20.0 (July 12, 2021

- Update dbt logo and links ([docs#197](https://github.com/fishtown-analytics/dbt-docs/issues/197))

## dbt 0.20.0rc1 (June 30, 2021)

- Display `tags` on exposures ([docs#194](https://github.com/fishtown-analytics/dbt-docs/issues/194), [docs#195](https://github.com/fishtown-analytics/dbt-docs/issues/195))

Contributors:
- [@stkbailey](https://github.com/stkbailey) ([docs#195](https://github.com/fishtown-analytics/dbt-docs/issues/195))

## dbt 0.20.0rc1 (June 4, 2021)
- Reversed the rendering direction of relationship tests so that the test renders in the model it is defined in ([docs#181](https://github.com/fishtown-analytics/dbt-docs/issues/181), [docs#183](https://github.com/fishtown-analytics/dbt-docs/pull/183))
- Support dots in model names: display them in the graphs ([docs#184](https://github.com/fishtown-analytics/dbt-docs/issues/184))
- Render meta tags for sources ([docs#192](https://github.com/fishtown-analytics/dbt-docs/issues/192))

Contributors:
- [@mascah](https://github.com/mascah) ([docs#181](https://github.com/fishtown-analytics/dbt-docs/issues/181), [docs#183](https://github.com/fishtown-analytics/dbt-docs/pull/183))
- [@monti-python](https://github.com/monti-python) ([docs#184](https://github.com/fishtown-analytics/dbt-docs/issues/184))
- [@diegodewilde](https://github.com/diegodewilde) ([docs#192](https://github.com/fishtown-analytics/dbt-docs/issues/192))

## dbt 0.19.0 (January 27, 2021)
- Fixed issue where data tests with tags were not showing up in graph viz ([docs#147](https://github.com/fishtown-analytics/dbt-docs/issues/147), [docs#156](https://github.com/fishtown-analytics/dbt-docs/pull/156))
- Clean up development dependencies and docs, fix package installation issue ([docs#164](https://github.com/fishtown-analytics/dbt-docs/issues/164), [docs#165](https://github.com/fishtown-analytics/dbt-docs/pull/165))

## dbt 0.19.0b1 (October 20, 2020)
- Add select/deselect option in DAG view dropups. ([docs#98](https://github.com/fishtown-analytics/dbt-docs/issues/98), [docs#138](https://github.com/fishtown-analytics/dbt-docs/pull/138))
- Fixed issue where sources with tags were not showing up in graph viz ([docs#93](https://github.com/fishtown-analytics/dbt-docs/issues/93), [docs#139](https://github.com/fishtown-analytics/dbt-docs/pull/139))
- Use `compiled_sql` instead of `injected_sql` for "Compiled" ([docs#146](https://github.com/fishtown-analytics/dbt-docs/issues/146), [docs#148](https://github.com/fishtown-analytics/dbt-docs/issues/148))

Contributors:
- [@Mr-Nobody99](https://github.com/Mr-Nobody99) ([docs#138](https://github.com/fishtown-analytics/dbt-docs/pull/138))
- [@jplynch77](https://github.com/jplynch77) ([docs#139](https://github.com/fishtown-analytics/dbt-docs/pull/139))

## dbt 0.18.1 (October 13, 2020)
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
