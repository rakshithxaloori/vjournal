import { Html } from "@react-email/components";
import { render } from "@react-email/render";

const Copier = ({ children, childProps }) => {
  console.log(childProps);
  const copyHtml = () => {
    let html = render(<Html>{children}</Html>, {
      pretty: true,
    });
    // Replace props values with prop keys
    // Object.keys(childProps).forEach((key) => {
    //   html = html.replace(childProps[key], `{${key}}`);
    // });
    console.log(html);
    navigator.clipboard.writeText(html);
  };

  const copyPlain = () => {
    let plain = render(<Html>{children}</Html>, {
      plainText: true,
    });
    // Replace props values with prop keys
    // Object.keys(childProps).forEach((key) => {
    //   plain = plain.replace(childProps[key], `{${key}}`);
    // });
    console.log(plain);
    navigator.clipboard.writeText(plain);
  };
  return (
    <>
      {children}
      <div>
        <button onClick={copyHtml}>Copy HTML</button>
        <button onClick={copyPlain}>Copy Plain Text</button>
      </div>
    </>
  );
};

export default Copier;
