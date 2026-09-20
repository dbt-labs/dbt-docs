
const { buildProjectTree } = require("./project_tree");

function node(resource_type, name, original_file_path, extra) {
    return Object.assign({
        unique_id: resource_type + ".my_pkg." + name,
        name: name,
        package_name: "my_pkg",
        resource_type: resource_type,
        original_file_path: original_file_path,
    }, extra || {});
}

// Returns the names of the entries found under a "/" separated folder path.
function namesAt(tree, folder_path) {
    let items = tree;
    folder_path.split("/").forEach(function(dir) {
        const folder = items.find(function(item) {
            return item.type === "folder" && item.name === dir;
        });
        if (!folder) {
            throw new Error("no folder named " + dir + " in " + JSON.stringify(items.map(i => i.name)));
        }
        items = folder.items;
    });
    return items.map(function(item) {
        return item.name;
    });
}

test("multiple snapshots defined in a single yaml file", () => {
    // dbt 1.9+ yaml snapshots all share the original_file_path of the yaml file
    // they are defined in. https://github.com/dbt-labs/dbt-docs/issues/95
    const nodes = [
        node("snapshot", "customer_snapshot", "snapshots/snapshots.yml"),
        node("snapshot", "product_snapshot", "snapshots/snapshots.yml"),
    ];

    const tree = buildProjectTree(nodes, [], null);

    expect(namesAt(tree, "my_pkg/snapshots")).toStrictEqual([
        "customer_snapshot",
        "product_snapshot",
    ]);
});

test("multiple snapshot blocks defined in a single sql file", () => {
    const nodes = [
        node("snapshot", "customer_snapshot", "snapshots/my_snapshots.sql"),
        node("snapshot", "product_snapshot", "snapshots/my_snapshots.sql"),
    ];

    const tree = buildProjectTree(nodes, [], null);

    expect(namesAt(tree, "my_pkg/snapshots")).toStrictEqual([
        "customer_snapshot",
        "product_snapshot",
    ]);
});

test("a macro named after a sibling folder", () => {
    // https://github.com/dbt-labs/dbt-docs/issues/442
    const macros = [
        node("macro", "utils", "macros/utils.sql"),
        node("macro", "helper", "macros/utils/helper.sql", {
            unique_id: "macro.my_pkg.helper",
        }),
    ];

    const tree = buildProjectTree([], macros, null);

    expect(namesAt(tree, "my_pkg/macros")).toStrictEqual(["utils", "utils"]);
    expect(namesAt(tree, "my_pkg/macros/utils")).toStrictEqual(["helper"]);
});

test("nesting, sorting and active flags", () => {
    const nodes = [
        node("model", "orders", "models/marts/orders.sql"),
        node("model", "customers", "models/marts/customers.sql"),
        node("seed", "country_codes", "seeds/country_codes.csv"),
    ];

    const tree = buildProjectTree(nodes, [], "model.my_pkg.orders");

    expect(tree.map(t => t.name)).toStrictEqual(["my_pkg"]);
    expect(namesAt(tree, "my_pkg")).toStrictEqual(["models", "seeds"]);
    expect(namesAt(tree, "my_pkg/models/marts")).toStrictEqual(["customers", "orders"]);
    expect(namesAt(tree, "my_pkg/seeds")).toStrictEqual(["country_codes"]);

    // the selected node and every folder above it are marked active
    const models = tree[0].items.find(item => item.name === "models");
    const marts = models.items.find(item => item.name === "marts");
    expect(models.active).toBe(true);
    expect(marts.active).toBe(true);
    expect(marts.items.find(item => item.name === "orders").active).toBe(true);
    expect(marts.items.find(item => item.name === "customers").active).toBe(false);
    expect(tree[0].items.find(item => item.name === "seeds").active).toBe(false);
});

test("versioned models are labelled with their version", () => {
    const nodes = [
        node("model", "dim_customers", "models/marts/dim_customers.sql", {
            unique_id: "model.my_pkg.dim_customers.v2",
            version: 2,
        }),
        node("model", "dim_customers", "models/marts/dim_customers_v1.sql", {
            unique_id: "model.my_pkg.dim_customers.v1",
            version: 1,
        }),
    ];

    const tree = buildProjectTree(nodes, [], null);

    expect(namesAt(tree, "my_pkg/models/marts")).toStrictEqual([
        "dim_customers_v1",
        "dim_customers_v2",
    ]);
});

test("hidden nodes and non model resource types are skipped", () => {
    const nodes = [
        node("model", "hidden", "models/hidden.sql", {docs: {show: false}}),
        node("model", "shown", "models/shown.sql", {docs: {show: true}}),
        node("source", "raw_orders", "models/sources.yml"),
        node("exposure", "weekly_report", "models/exposures.yml"),
        node("metric", "revenue", "models/metrics.yml"),
        node("semantic_model", "orders", "models/semantic_models.yml"),
        node("saved_query", "orders_query", "models/saved_queries.yml"),
        node("function", "to_cents", "functions/to_cents.yml"),
    ];

    const tree = buildProjectTree(nodes, [], null);

    expect(namesAt(tree, "my_pkg/models")).toStrictEqual(["shown"]);
});

test("windows style paths", () => {
    const nodes = [
        node("snapshot", "customer_snapshot", "snapshots\\snapshots.yml"),
        node("snapshot", "product_snapshot", "snapshots\\snapshots.yml"),
    ];

    const tree = buildProjectTree(nodes, [], null);

    expect(namesAt(tree, "my_pkg/snapshots")).toStrictEqual([
        "customer_snapshot",
        "product_snapshot",
    ]);
});
