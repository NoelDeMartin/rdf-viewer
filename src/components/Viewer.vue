<template>
  <div class="p-4 size-full">
    <v-network-graph class="w-full border rounded-md" :nodes="network.nodes" :edges="network.edges" :configs>
      <template #edge-label="{ edge, ...slotProps }">
        <v-edge-label :text="edge.label" align="center" vertical-align="above" v-bind="slotProps" />
      </template>
      <template #override-node="slotProps">
        <ViewerNode v-bind="{ ...slotProps, ...network.extra[slotProps.nodeId] }" />
      </template>
    </v-network-graph>
  </div>
</template>

<script setup lang="ts">
import type { Quad, NamedNode } from '@rdfjs/types';
import { computed, onMounted, reactive } from 'vue';
import { updateLocationQueryParameters } from '@noeldemartin/utils';
import { quadsToTurtle, SolidStore, RDFNamedNode } from '@noeldemartin/solid-utils';

import * as vNG from 'v-network-graph';
import { ForceLayout } from 'v-network-graph/lib/force-layout';
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout';

const KNOWN_LABELS = ['rdfs:label', 'schema:name'];
const { graph } = defineProps<{ graph: Quad[] }>();

const store = new SolidStore(graph);

function arrayFirst<TItem, TMap>(
  items: TItem[],
  predicate: (item: TMap) => boolean,
  map: (item: TItem) => TMap,
): TMap | null {
  for (const item of items) {
    const mapped = map(item);

    if (predicate(mapped)) {
      return mapped;
    }
  }

  return null;
}

const configs = reactive(
  vNG.defineConfigs({
    view: {
      layoutHandler: new ForceLayout({
        positionFixedByDrag: false,
        positionFixedByClickWithAltKey: true,
        createSimulation: (d3, nodes, edges) => {
          // d3-force parameters
          const forceLink = d3
            .forceLink<ForceNodeDatum, ForceEdgeDatum>(edges)
            .id((d: ForceNodeDatum) => d.id);
          return d3
            .forceSimulation(nodes)
            .force('edge', forceLink.distance(40).strength(0.5))
            .force('charge', d3.forceManyBody().strength(-800))
            .force('center', d3.forceCenter().strength(0.05))
            .alphaMin(0.001);

          // * The following are the default parameters for the simulation.
          // const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
          // return d3
          //   .forceSimulation(nodes)
          //   .force("edge", forceLink.distance(100))
          //   .force("charge", d3.forceManyBody())
          //   .force("collide", d3.forceCollide(50).strength(0.2))
          //   .force("center", d3.forceCenter().strength(0.05))
          //   .alphaMin(0.001)
        },
      }),
    },
  }),
);

const network = computed(() => {
  const subjects = Array.from(new Set(store.getQuads().map((quad) => quad.subject.value))).map(
    (id) => new RDFNamedNode(id),
  );

  const extra: Record<string, { subject: NamedNode }> = {};
  const nodes = Object.fromEntries(
    subjects.map((subject) => {
      const name =
        arrayFirst(
          KNOWN_LABELS,
          (label) => !!label,
          (label) => store.statement(subject, label)?.object.value,
        ) ??
        store.statement(subject, 'rdf:type')?.object.value ??
        subject.value;

        extra[subject.value] = { subject };

      return [subject.value, { name }];
    }),
  );

  const edges = Object.fromEntries(
    subjects
      .flatMap((subject) => {
        const relations = store.statements(undefined, undefined, subject);

        return relations.map((relation) => {
          return {
            label: relation.predicate.value,
            source: relation.subject.value,
            target: relation.object.value,
          };
        });
      })
      .map((edge, index) => [String(index), edge]),
  );

  return {
    nodes,
    edges,
    extra,
  };
});

onMounted(() => {
  const turtle = quadsToTurtle(graph);

  updateLocationQueryParameters({
    graph: btoa(turtle),
  });
});
</script>
