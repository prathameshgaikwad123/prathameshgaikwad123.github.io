/* Dino The Diamond, on the same shell as every case study. The page is the
   project in its owner's own words and a link to where it lives: the
   picture is the cover the shell already sets at the top, so nothing here
   repeats it. */

export default function blocks(project) {
    /* The collection's link is the one on the record, so it is written once. */
    const opensea = project.facts.find(([, value]) => value.links)[1].links[0];

    return [
        {
            key: 'about',
            label: 'About',
            body: (
                <>
                    <p>
                        This project was born from passion, creativity, and the joy of
                        building something timeless. It’s more than an NFT project; it’s a
                        reflection of my journey, emotions, and dreams.
                    </p>
                    <p>
                        Every moment spent creating it has been deeply personal. Dino The
                        Diamond will always stay close to me — a living memory, shining
                        forever on the blockchain, reminding me that art and love can truly
                        be eternal.
                    </p>
                </>
            ),
        },
        {
            key: 'collection',
            label: 'The collection',
            body: (
                <p>
                    Dino The Diamond is on OpenSea.{' '}
                    <a href={opensea.href} target="_blank" rel="noopener noreferrer">
                        View the collection
                    </a>
                    .
                </p>
            ),
        },
    ];
}
