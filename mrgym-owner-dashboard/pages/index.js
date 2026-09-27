// This site has no marketing homepage of its own (that's the separate
// mrgym-public project) — visiting its root just sends staff on to the
// dashboard, which redirects to /login if they're not signed in yet.
export async function getServerSideProps() {
  return { redirect: { destination: "/dashboard", permanent: false } };
}

export default function Index() {
  return null;
}
