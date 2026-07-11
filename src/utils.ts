interface ITeammate {
  name: string;
  bio: string;
  git: string;
  photo?: string;
}
const teammates: ITeammate[] = [
  {
    name: 'Irina Dedova',
    bio: `
      Alexandroupoli, Greece.<br>
      I used to work at a bank in the Compliance Department. In 2022, I acquired a web development diploma from ITMO University, and in 2023 I successfully completed the course 'JS/FE Pre-School 2022Q4' at RS School with the maximum score. I am currently learning Front-end development at RS School.<br>
      <strong>Contributions to the project:</strong><br>
      - CommerceTools Project creation and API Client Setup;<br>
      - Sign up page: customer registration and fields validation;<br>
      - Profile page: user's info and addresses, edit mode;<br>
      - Cart page: display, modify and remove items, promo code, total sum and empty cart message.<br>
      <strong>Additional responsibilities:</strong> Repository Keeper, Project Deployer and Cross-check Submitter.
    `,
    git: 'https://github.com/Ir4D',
    photo: './images/avatars/irina.jpg'
  },
  {
    name: 'Dzmitry Maltsau',
    bio: `Gomel, Republic of Belarus <br/> 
    Used to work as an oil engineer, currently making first steps in front-end development <br/> Tech Stack: JS, TS, HTML, CSS, React.<br/> 
    <strong>Contributions to the project:</strong><br>
     - Routing implementation;<br>
     - 404 page layout;<br>
     - Catalog page layout;<br>
     - Catalog sort and filter algorithms implementation.<br>
     <strong>Additional responsibilities:</strong> Space harmonizer: insisted on unifying the code, developed basic parent components.`,

    git: 'https://github.com/Maltsau',
    photo: './images/avatars/dzmitry.png'
  },
  {
    name: 'Natalia Vozhdaeva',
    bio: `Cairo, Egypt <br/> I used to work as a journalist and guide. In 2020 tried the first course in front-end, and couldn't stop. Nowadays I have experience in HTML, CSS, Javascript, and TypeScript, and a bit of experience with React and Angular. But I'm still a CSS lover: can make burger-menu, slider, accordion, and, maybe, everithing else without js)<br>
    <strong>Contributions to the project:</strong><br>
     - Main-, aboutUs-, and goodItem-pages;<br>
     - Creating reusable components fof building pages;<br>
     - User interaction with cart from product-page;<br>
     - Product-base implementation.<br>
     <strong>Additional responsibilities:</strong> Postproduction: searching pictures, correcting layouts, unifying appearance.`,
    git: 'https://github.com/NataliaVozhdaeva',
    photo: './images/avatars/natalia.jpg'
  }
];

export { teammates };
